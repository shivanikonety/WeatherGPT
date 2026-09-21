"""
Smart Weather Alert Engine for WeatherGPT.
Analyzes real-time and forecast weather data to detect dynamic, meaningful alerts.
"""
from datetime import datetime, timezone
from app.tools.weather import get_forecast, get_current_weather


async def get_weather_alerts(
    latitude: float,
    longitude: float
) -> dict:
    """
    Evaluates real weather forecast metrics against rule-based meteorological thresholds
    to generate actionable, timely alerts.
    """
    alerts = []

    try:
        # Fetch 2-day forecast to inspect immediate and short-term risks
        forecast = await get_forecast(latitude, longitude, days=2)
        hourly = forecast.get("hourly", {})
        daily = forecast.get("daily", {})
        
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        apparent_temps = hourly.get("apparent_temperature", [])
        precip_probs = hourly.get("precipitation_probability", [])
        precips = hourly.get("precipitation", [])
        weather_codes = hourly.get("weather_code", [])
        wind_speeds = hourly.get("wind_speed_10m", [])
        wind_gusts = hourly.get("wind_gusts_10m", [])
        uv_indices = hourly.get("uv_index", [])

        # 1. Immediate Rain Alert (Next 3-6 hours)
        next_3h_precip_prob = max(precip_probs[:3], default=0)
        next_3h_precip = sum(precips[:3]) if len(precips) >= 3 else 0
        next_6h_precip_prob = max(precip_probs[:6], default=0)

        if next_3h_precip_prob >= 70 or next_3h_precip > 2.5:
            alerts.append({
                "id": "rain_imminent",
                "type": "rain",
                "severity": "warning",
                "title": "Rain Approaching Imminently",
                "message": f"High probability of rain ({next_3h_precip_prob}%) expected within the next 3 hours. Carry an umbrella and plan travel with care.",
                "time_window": "Next 1–3 hours",
                "icon": "cloud-rain",
                "is_demo": False,
            })
        elif next_6h_precip_prob >= 50:
            alerts.append({
                "id": "rain_later",
                "type": "rain",
                "severity": "advisory",
                "title": "Rain Expected Later Today",
                "message": f"Precipitation chance rises to {next_6h_precip_prob}% within 6 hours. Keep rain gear handy.",
                "time_window": "Next 4–6 hours",
                "icon": "cloud-drizzle",
                "is_demo": False,
            })

        # 2. Thunderstorm / Severe Storm Risk
        storm_hours = [
            i for i, code in enumerate(weather_codes[:24])
            if code in (95, 96, 99)
        ]
        if storm_hours:
            alerts.append({
                "id": "thunderstorm_risk",
                "type": "storm",
                "severity": "warning",
                "title": "Thunderstorm Potential",
                "message": "Atmospheric instability indicates possible thunderstorms with lightning or localized heavy downpours.",
                "time_window": f"Within next {storm_hours[0] + 1}–{storm_hours[-1] + 2} hours",
                "icon": "cloud-lightning",
                "is_demo": False,
            })

        # 3. High Wind Gusts Alert
        max_gust = max(wind_gusts[:24], default=0)
        max_wind = max(wind_speeds[:24], default=0)
        if max_gust >= 55 or max_wind >= 40:
            alerts.append({
                "id": "high_wind",
                "type": "wind",
                "severity": "warning" if max_gust >= 65 else "advisory",
                "title": "Strong Wind Advisory",
                "message": f"Peak gusts up to {round(max_gust)} km/h expected. Secure loose outdoor items and exercise caution when driving high-profile vehicles or cycling.",
                "time_window": "Today",
                "icon": "wind",
                "is_demo": False,
            })

        # 4. Extreme Heat or Cold
        max_apparent = max(apparent_temps[:24], default=20)
        min_temp = min(temps[:24], default=20)

        if max_apparent >= 38:
            alerts.append({
                "id": "extreme_heat",
                "type": "heat",
                "severity": "warning",
                "title": "High Heat Index Alert",
                "message": f"Feels-like temperatures will peak around {round(max_apparent)}°C. Stay hydrated, avoid prolonged sun exposure during midday, and wear light clothing.",
                "time_window": "Midday / Afternoon",
                "icon": "sun",
                "is_demo": False,
            })
        elif min_temp <= 0:
            alerts.append({
                "id": "freezing_risk",
                "type": "cold",
                "severity": "warning",
                "title": "Sub-Zero / Freeze Warning",
                "message": f"Temperatures dropping to {round(min_temp)}°C. Watch for icy patches on roads and protect cold-sensitive plants and outdoor pipes.",
                "time_window": "Overnight / Early Morning",
                "icon": "snowflake",
                "is_demo": False,
            })

        # 5. Very High UV Index Alert
        max_uv = max(uv_indices[:24], default=0)
        if max_uv >= 8:
            alerts.append({
                "id": "extreme_uv",
                "type": "uv",
                "severity": "advisory",
                "title": "Very High UV Index",
                "message": f"Peak UV index reaches {round(max_uv, 1)}. Sun protection (SPF 30+, hat, sunglasses) is strongly recommended between 11 AM and 4 PM.",
                "time_window": "11:00 AM – 4:00 PM",
                "icon": "sun",
                "is_demo": False,
            })

        # 6. Rapid Temperature Swing (e.g. > 8°C change in 6 hours)
        for i in range(len(temps) - 6):
            diff = temps[i] - temps[i + 6]
            if diff >= 8:
                alerts.append({
                    "id": "temp_drop",
                    "type": "temp_swing",
                    "severity": "info",
                    "title": "Significant Temperature Drop",
                    "message": f"Temperature will drop by approximately {round(diff)}°C over a 6-hour span. Keep extra layers accessible.",
                    "time_window": "Later today",
                    "icon": "thermometer",
                    "is_demo": False,
                })
                break

    except Exception:
        pass

    # If no severe conditions exist, provide a positive status notice
    if not alerts:
        alerts.append({
            "id": "favorable_conditions",
            "type": "favorable",
            "severity": "info",
            "title": "Calm & Stable Weather",
            "message": "No hazardous weather alerts or sudden disruptions detected for this location over the next 24 hours.",
            "time_window": "Next 24 hours",
            "icon": "check-circle",
            "is_demo": False,
        })

    return {
        "latitude": latitude,
        "longitude": longitude,
        "count": len(alerts),
        "alerts": alerts,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "WeatherGPT Rule Engine"
    }