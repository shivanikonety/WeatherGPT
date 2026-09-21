"""
Weather Comparison Service for WeatherGPT.
Enables side-by-side comparative analysis between two dates or two locations with delta intelligence.
"""
from typing import Dict, Any, Optional
import asyncio
from app.tools.weather import get_forecast, get_current_weather
from app.utils.weather_codes import get_weather_info
from app.utils.conversions import celsius_to_fahrenheit, kmh_to_mph, mm_to_inches


async def compare_days(
    latitude: float,
    longitude: float,
    day1_offset: int = 0,
    day2_offset: int = 1,
    location_name: Optional[str] = None,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Compares two days (e.g., Today vs Tomorrow) for a given location.
    """
    days_to_fetch = max(day1_offset, day2_offset) + 2
    forecast = await get_forecast(latitude, longitude, days=days_to_fetch)
    daily_structured = forecast.get("daily_structured", [])

    if len(daily_structured) <= max(day1_offset, day2_offset):
        raise ValueError("Requested day offsets exceed available forecast horizon.")

    day1 = daily_structured[day1_offset]
    day2 = daily_structured[day2_offset]

    day1_label = "Today" if day1_offset == 0 else f"Day +{day1_offset} ({day1['date']})"
    day2_label = "Tomorrow" if day2_offset == 1 else f"Day +{day2_offset} ({day2['date']})"

    # Calculate Deltas
    temp_max_diff = round((day2["temp_max"] or 0) - (day1["temp_max"] or 0), 1)
    temp_min_diff = round((day2["temp_min"] or 0) - (day1["temp_min"] or 0), 1)
    rain_prob_diff = int((day2["precipitation_probability"] or 0) - (day1["precipitation_probability"] or 0))
    rain_sum_diff = round((day2["precipitation_sum"] or 0) - (day1["precipitation_sum"] or 0), 1)
    wind_diff = round((day2["wind_speed_max"] or 0) - (day1["wind_speed_max"] or 0), 1)

    # Human-friendly delta phrases
    if temp_max_diff > 0.5:
        temp_verdict = f"{abs(temp_max_diff)}°C warmer"
    elif temp_max_diff < -0.5:
        temp_verdict = f"{abs(temp_max_diff)}°C cooler"
    else:
        temp_verdict = "virtually identical peak temperature"

    if rain_prob_diff > 15:
        rain_verdict = f"{abs(rain_prob_diff)}% higher rain risk"
    elif rain_prob_diff < -15:
        rain_verdict = f"{abs(rain_prob_diff)}% lower rain risk"
    else:
        rain_verdict = "similar rain probability"

    # AI / Rule summary sentence
    summary_parts = []
    summary_parts.append(
        f"{day2_label} is expected to be {temp_verdict} than {day1_label.lower()} (high of {day2['temp_max']}°C vs {day1['temp_max']}°C)."
    )
    if rain_prob_diff != 0 or day2['precipitation_probability'] > 30:
        summary_parts.append(
            f"Precipitation chance is {day2['precipitation_probability']}% on {day2_label.lower()} compared to {day1['precipitation_probability']}% {day1_label.lower()}."
        )
    if abs(wind_diff) >= 8:
        summary_parts.append(
            f"Winds will be notably {'stronger' if wind_diff > 0 else 'calmer'} (max {day2['wind_speed_max']} km/h)."
        )

    ai_insight = " ".join(summary_parts)

    return {
        "mode": "days",
        "location": location_name or f"{latitude:.2f}, {longitude:.2f}",
        "day1": {
            "label": day1_label,
            **day1
        },
        "day2": {
            "label": day2_label,
            **day2
        },
        "deltas": {
            "temp_max_diff": temp_max_diff,
            "temp_max_diff_f": round(temp_max_diff * 9 / 5, 1),
            "temp_min_diff": temp_min_diff,
            "temp_min_diff_f": round(temp_min_diff * 9 / 5, 1),
            "rain_prob_diff": rain_prob_diff,
            "rain_sum_diff": rain_sum_diff,
            "wind_diff": wind_diff,
            "temp_verdict": temp_verdict,
            "rain_verdict": rain_verdict,
        },
        "insight": ai_insight,
        "summary": ai_insight,
        "source": "WeatherGPT Comparison Engine"
    }


async def compare_locations(
    loc1_name: str,
    loc1_lat: float,
    loc1_lon: float,
    loc2_name: str,
    loc2_lat: float,
    loc2_lon: float,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Compares two geographical locations side-by-side with real-time deltas and insights.
    """
    w1, w2 = await asyncio.gather(
        get_current_weather(loc1_lat, loc1_lon, units=units),
        get_current_weather(loc2_lat, loc2_lon, units=units)
    )

    t1 = w1.get("temperature", 0.0)
    t2 = w2.get("temperature", 0.0)
    f1 = w1.get("feels_like", t1)
    f2 = w2.get("feels_like", t2)
    h1 = w1.get("humidity", 0)
    h2 = w2.get("humidity", 0)
    wind1 = w1.get("wind_speed", 0.0)
    wind2 = w2.get("wind_speed", 0.0)

    temp_diff = round(t2 - t1, 1)
    feels_diff = round(f2 - f1, 1)
    humidity_diff = round(h2 - h1)
    wind_diff = round(wind2 - wind1, 1)

    # Narrative synthesis
    if temp_diff > 1.0:
        verdict = f"{loc2_name} is currently {abs(temp_diff)}°C warmer than {loc1_name}."
    elif temp_diff < -1.0:
        verdict = f"{loc2_name} is currently {abs(temp_diff)}°C cooler than {loc1_name}."
    else:
        verdict = f"{loc1_name} and {loc2_name} share almost identical temperatures ({t1}°C vs {t2}°C)."

    insight_items = [verdict]
    if abs(humidity_diff) >= 15:
        wetter_loc = loc2_name if humidity_diff > 0 else loc1_name
        insight_items.append(f"{wetter_loc} is notably more humid ({max(h1, h2)}% vs {min(h1, h2)}%).")
    if abs(wind_diff) >= 10:
        windier_loc = loc2_name if wind_diff > 0 else loc1_name
        insight_items.append(f"{windier_loc} is experiencing stronger winds ({max(wind1, wind2)} km/h).")

    return {
        "mode": "locations",
        "location1": {
            "name": loc1_name,
            **w1
        },
        "location2": {
            "name": loc2_name,
            **w2
        },
        "deltas": {
            "temp_diff": temp_diff,
            "temp_diff_f": round(temp_diff * 9 / 5, 1),
            "feels_diff": feels_diff,
            "feels_diff_f": round(feels_diff * 9 / 5, 1),
            "humidity_diff": humidity_diff,
            "wind_diff": wind_diff,
            "wind_diff_mph": round(wind_diff * 0.621371, 1),
            "verdict": verdict
        },
        "insight": " ".join(insight_items),
        "summary": " ".join(insight_items),
        "source": "WeatherGPT Location Comparator"
    }
