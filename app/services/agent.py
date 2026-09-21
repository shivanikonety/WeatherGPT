"""
Weather Agent Context Aggregator for WeatherGPT.
Assembles live weather data, forecast models, dynamic alerts,
impact intelligence, timeline breakdowns, and decision rules.
"""
from typing import Dict, Any, Optional
import asyncio

from app.tools.weather import get_current_weather, get_forecast
from app.tools.alerts import get_weather_alerts
from app.tools.advisory import generate_weather_impact, generate_advisory
from app.tools.decision import generate_decision
from app.services.timeline import generate_timeline


async def get_weather_context(
    latitude: float,
    longitude: float,
    days: int = 3,
    message: str = "",
    location_name: Optional[str] = None,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Fetches and unifies all meteorological intelligence for a given coordinate or query location.
    """
    target_lat = latitude
    target_lon = longitude
    target_name = location_name

    # Check if user message specifies an explicit location
    if message and message.strip():
        try:
            from app.services.nlp import parse_natural_query
            from app.tools.geocode import geocode_place
            parsed = parse_natural_query(message)
            cand = parsed.get("location", "").strip()
            if cand and len(cand) >= 3 and cand.lower() not in ["weather", "forecast", "temp", "today", "tomorrow"]:
                geo = await geocode_place(cand)
                if geo and geo.get("results") and len(geo["results"]) > 0:
                    top_loc = geo["results"][0]
                    target_lat = top_loc["latitude"]
                    target_lon = top_loc["longitude"]
                    target_name = top_loc["name"]
        except Exception:
            pass

    # Fetch current weather, forecast, and alerts concurrently for maximum speed
    current_coro = get_current_weather(target_lat, target_lon, units=units)
    forecast_coro = get_forecast(target_lat, target_lon, days=days, units=units)
    alerts_coro = get_weather_alerts(target_lat, target_lon)

    current, forecast, alerts = await asyncio.gather(
        current_coro,
        forecast_coro,
        alerts_coro
    )

    # Compute rule-based intelligence layers
    impact = generate_weather_impact(current, forecast=forecast, units=units)
    advisory = generate_advisory(current)
    timeline = generate_timeline(forecast, days=days, units=units)
    decision = generate_decision(message, forecast)

    return {
        "location_name": target_name or f"{target_lat:.2f}, {target_lon:.2f}",
        "current_weather": current,
        "forecast": forecast,
        "alerts": alerts,
        "impact": impact,
        "advisory": advisory,
        "timeline": timeline,
        "decision": decision
    }