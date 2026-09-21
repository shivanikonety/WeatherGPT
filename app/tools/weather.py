import asyncio
from datetime import datetime, timezone
import httpx

from app.config import settings
from app.utils.weather_codes import get_weather_description, get_weather_info
from app.utils.conversions import (
    celsius_to_fahrenheit,
    kmh_to_mph,
    mm_to_inches,
)
from app.services.cache import cache


async def get_air_quality(latitude: float, longitude: float) -> dict:
    """
    Fetch current air quality data from Open-Meteo Air Quality API.
    Gracefully falls back to None if service is unreachable.
    """
    cache_key = f"air_quality:{round(latitude, 3)}:{round(longitude, 3)}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone"
        ),
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(settings.open_meteo_air_quality_url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                current_aq = data.get("current", {})
                us_aqi = current_aq.get("us_aqi")
                
                # Determine AQI category
                category = "Good"
                if us_aqi is not None:
                    if us_aqi > 300:
                        category = "Hazardous"
                    elif us_aqi > 200:
                        category = "Very Unhealthy"
                    elif us_aqi > 150:
                        category = "Unhealthy"
                    elif us_aqi > 100:
                        category = "Unhealthy for Sensitive Groups"
                    elif us_aqi > 50:
                        category = "Moderate"
                    else:
                        category = "Good"

                result = {
                    "us_aqi": us_aqi,
                    "european_aqi": current_aq.get("european_aqi"),
                    "pm2_5": current_aq.get("pm2_5"),
                    "pm10": current_aq.get("pm10"),
                    "category": category,
                    "source": "Open-Meteo Air Quality",
                }
                cache.set(cache_key, result, ttl=600)
                return result
    except Exception:
        pass
    
    return {
        "us_aqi": None,
        "european_aqi": None,
        "pm2_5": None,
        "pm10": None,
        "category": "Unavailable",
        "source": "Open-Meteo Air Quality",
    }


async def get_current_weather(
    latitude: float,
    longitude: float,
    units: str = "metric"
) -> dict:
    """
    Fetch comprehensive current weather data with metadata, feels like,
    UV index, air quality, and wind details.
    """
    cache_key = f"current_weather:{round(latitude, 4)}:{round(longitude, 4)}"
    cached_weather = cache.get(cache_key)

    if cached_weather is not None:
        weather_copy = dict(cached_weather)
        if "condition" not in weather_copy:
            weather_copy["condition"] = weather_copy.get("weather_description", "Clear")
        if "apparent_temperature" not in weather_copy:
            weather_copy["apparent_temperature"] = weather_copy.get("feels_like")
        if "precipitation_probability" not in weather_copy:
            weather_copy["precipitation_probability"] = 0
        if units == "imperial":
            _apply_imperial_conversions_current(weather_copy)
        return weather_copy

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "is_day,"
            "precipitation,"
            "rain,"
            "showers,"
            "snowfall,"
            "weather_code,"
            "cloud_cover,"
            "surface_pressure,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "wind_gusts_10m,"
            "uv_index"
        ),
        "daily": "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
        "forecast_days": 1,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp_weather, aq_data = await asyncio.gather(
                client.get(settings.open_meteo_forecast_url, params=params),
                get_air_quality(latitude, longitude),
                return_exceptions=True
            )

            if isinstance(resp_weather, Exception):
                raise resp_weather

            resp_weather.raise_for_status()
            data = resp_weather.json()

        current = data.get("current", {})
        daily = data.get("daily", {})
        weather_code = current.get("weather_code", 0)
        weather_info = get_weather_info(weather_code)

        temp_c = current.get("temperature_2m")
        feels_c = current.get("apparent_temperature")
        wind_kmh = current.get("wind_speed_10m")
        precip_mm = current.get("precipitation", 0.0)
        gusts_kmh = current.get("wind_gusts_10m")

        temp_max = daily.get("temperature_2m_max", [None])[0] if daily.get("temperature_2m_max") else None
        temp_min = daily.get("temperature_2m_min", [None])[0] if daily.get("temperature_2m_min") else None
        sunrise = daily.get("sunrise", [None])[0] if daily.get("sunrise") else None
        sunset = daily.get("sunset", [None])[0] if daily.get("sunset") else None
        uv_max = daily.get("uv_index_max", [None])[0] if daily.get("uv_index_max") else current.get("uv_index")
        precip_prob_max = daily.get("precipitation_probability_max", [0])[0] if daily.get("precipitation_probability_max") else 0

        air_quality = aq_data if isinstance(aq_data, dict) else {}

        weather = {
            "latitude": data.get("latitude", latitude),
            "longitude": data.get("longitude", longitude),
            "timezone": data.get("timezone", "UTC"),
            "time": current.get("time"),
            "temperature": temp_c,
            "humidity": current.get("relative_humidity_2m"),
            "feels_like": feels_c,
            "apparent_temperature": feels_c,
            "precipitation": precip_mm,
            "precipitation_probability": precip_prob_max,
            "rain": current.get("rain", 0.0),
            "showers": current.get("showers", 0.0),
            "snowfall": current.get("snowfall", 0.0),
            "weather_code": weather_code,
            "condition": weather_info["description"],
            "weather_description": weather_info["description"],
            "weather_icon": weather_info["icon"],
            "weather_category": weather_info["category"],
            "is_day": bool(current.get("is_day", 1)),
            "cloud_cover": current.get("cloud_cover"),
            "wind_speed": wind_kmh,
            "wind_direction": current.get("wind_direction_10m"),
            "wind_gusts": gusts_kmh,
            "surface_pressure": current.get("surface_pressure"),
            "uv_index": current.get("uv_index", 0.0),
            "uv_index_max": uv_max,
            "temp_max": temp_max,
            "temp_min": temp_min,
            "sunrise": sunrise,
            "sunset": sunset,
            "air_quality": air_quality,
            "source": "Open-Meteo",
            "units": "metric",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }

        cache.set(cache_key, weather, ttl=300)

        if units == "imperial":
            weather_converted = dict(weather)
            _apply_imperial_conversions_current(weather_converted)
            return weather_converted

        return weather

    except httpx.TimeoutException:
        raise Exception("Weather API request timed out. Please try again.")
    except httpx.HTTPError as e:
        raise Exception(f"Weather API request failed: {str(e)}")
    except KeyError as e:
        raise Exception(f"Unexpected weather API response format: missing key {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to retrieve weather data: {str(e)}")


def _apply_imperial_conversions_current(w: dict):
    w["units"] = "imperial"
    if w.get("temperature") is not None:
        w["temperature_f"] = celsius_to_fahrenheit(w["temperature"])
    if w.get("feels_like") is not None:
        w["feels_like_f"] = celsius_to_fahrenheit(w["feels_like"])
    if w.get("temp_max") is not None:
        w["temp_max_f"] = celsius_to_fahrenheit(w["temp_max"])
    if w.get("temp_min") is not None:
        w["temp_min_f"] = celsius_to_fahrenheit(w["temp_min"])
    if w.get("wind_speed") is not None:
        w["wind_speed_mph"] = kmh_to_mph(w["wind_speed"])
    if w.get("wind_gusts") is not None:
        w["wind_gusts_mph"] = kmh_to_mph(w["wind_gusts"])
    if w.get("precipitation") is not None:
        w["precipitation_in"] = mm_to_inches(w["precipitation"])


async def get_forecast(
    latitude: float,
    longitude: float,
    days: int = 7,
    units: str = "metric"
) -> dict:
    """
    Fetch comprehensive forecast data including hourly and daily projections.
    """
    if days < 1 or days > 16:
        raise ValueError("Forecast days must be between 1 and 16.")

    cache_key = f"forecast:{round(latitude, 4)}:{round(longitude, 4)}:{days}"
    cached_forecast = cache.get(cache_key)

    if cached_forecast is not None:
        f_copy = dict(cached_forecast)
        if "forecast" not in f_copy:
            f_copy["forecast"] = f_copy.get("daily_structured", [])
        return f_copy

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m,"
            "is_day,"
            "uv_index"
        ),
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation_probability,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_gusts_10m,"
            "uv_index,"
            "is_day"
        ),
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "apparent_temperature_max,"
            "apparent_temperature_min,"
            "sunrise,"
            "sunset,"
            "uv_index_max,"
            "precipitation_sum,"
            "precipitation_probability_max,"
            "wind_speed_10m_max,"
            "wind_gusts_10m_max"
        ),
        "forecast_days": days,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                settings.open_meteo_forecast_url,
                params=params
            )
            response.raise_for_status()
            data = response.json()

        # Build structured daily list
        daily_raw = data.get("daily", {})
        daily_times = daily_raw.get("time", [])
        daily_structured = []
        for i, dt in enumerate(daily_times):
            w_code = daily_raw.get("weather_code", [])[i] if i < len(daily_raw.get("weather_code", [])) else 0
            w_info = get_weather_info(w_code)
            max_t = daily_raw.get("temperature_2m_max", [])[i] if i < len(daily_raw.get("temperature_2m_max", [])) else None
            min_t = daily_raw.get("temperature_2m_min", [])[i] if i < len(daily_raw.get("temperature_2m_min", [])) else None
            precip_prob = daily_raw.get("precipitation_probability_max", [])[i] if i < len(daily_raw.get("precipitation_probability_max", [])) else 0
            precip_sum = daily_raw.get("precipitation_sum", [])[i] if i < len(daily_raw.get("precipitation_sum", [])) else 0
            wind_max = daily_raw.get("wind_speed_10m_max", [])[i] if i < len(daily_raw.get("wind_speed_10m_max", [])) else 0
            uv_max = daily_raw.get("uv_index_max", [])[i] if i < len(daily_raw.get("uv_index_max", [])) else 0
            sr = daily_raw.get("sunrise", [])[i] if i < len(daily_raw.get("sunrise", [])) else None
            ss = daily_raw.get("sunset", [])[i] if i < len(daily_raw.get("sunset", [])) else None

            daily_structured.append({
                "date": dt,
                "weather_code": w_code,
                "description": w_info["description"],
                "icon": w_info["icon"],
                "temp_max": max_t,
                "temp_min": min_t,
                "temp_max_f": celsius_to_fahrenheit(max_t),
                "temp_min_f": celsius_to_fahrenheit(min_t),
                "precipitation_probability": precip_prob,
                "precipitation_sum": precip_sum,
                "precipitation_sum_in": mm_to_inches(precip_sum),
                "wind_speed_max": wind_max,
                "wind_speed_max_mph": kmh_to_mph(wind_max),
                "uv_index_max": uv_max,
                "sunrise": sr,
                "sunset": ss,
            })

        forecast = {
            "latitude": data.get("latitude", latitude),
            "longitude": data.get("longitude", longitude),
            "timezone": data.get("timezone", "UTC"),
            "current": data.get("current", {}),
            "hourly": data.get("hourly", {}),
            "daily": daily_raw,
            "daily_structured": daily_structured,
            "forecast": daily_structured,
            "source": "Open-Meteo",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }

        cache.set(cache_key, forecast, ttl=300)
        return forecast

    except httpx.TimeoutException:
        raise Exception("Forecast API request timed out. Please try again.")
    except httpx.HTTPError as e:
        raise Exception(f"Forecast API request failed: {str(e)}")
    except KeyError as e:
        raise Exception(f"Unexpected forecast API response: missing {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to retrieve forecast data: {str(e)}")