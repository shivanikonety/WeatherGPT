"""
Context-Aware Decision Assistant for WeatherGPT.
Analyzes user intent and queries to provide direct, practical recommendations.
"""
from typing import Dict, Any


def generate_decision(message: str, forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an intelligent context-aware decision based on the user query,
    weather forecast, hourly timelines, and activity types.
    """
    message_lower = message.lower()
    hourly = forecast.get("hourly", {})

    precipitation_probability = hourly.get("precipitation_probability", [])
    precipitation = hourly.get("precipitation", [])
    weather_codes = hourly.get("weather_code", [])
    wind_speeds = hourly.get("wind_speed_10m", [])
    temperatures = hourly.get("temperature_2m", [])

    # Examine short-term window (next 8 hours)
    window = 8
    rain_prob = max(precipitation_probability[:window], default=0)
    rain_amount = max(precipitation[:window], default=0)
    max_wind = max(wind_speeds[:window], default=0)
    max_temp = max(temperatures[:window], default=20)
    min_temp = min(temperatures[:window], default=20)

    decision = "Weather conditions look generally favorable."
    reason = "No major weather disruptions or severe risks detected in the upcoming hours."
    risk_level = "low"
    category = "general"

    # Specific Query Handlers
    # 1. Umbrella / Rain Queries
    if any(w in message_lower for w in ["umbrella", "rain", "shower", "wet", "drizzle"]):
        category = "rain"
        if rain_prob >= 60 or rain_amount > 2:
            risk_level = "high"
            decision = "Yes, carry an umbrella."
            reason = f"There is a high chance of rain ({rain_prob}%) with estimated precipitation up to {round(rain_amount, 1)} mm."
        elif rain_prob >= 35:
            risk_level = "moderate"
            decision = "Recommended to carry an umbrella as a precaution."
            reason = f"Moderate chance of rain ({rain_prob}%) detected during the upcoming hours."
        else:
            risk_level = "low"
            decision = "An umbrella is likely unnecessary."
            reason = f"Rain probability is low ({rain_prob}%) and conditions appear mostly dry."

    # 2. Outdoor Activities (Running, Walking, Cycling, Sports, Hiking)
    elif any(w in message_lower for w in ["run", "jog", "walk", "bike", "cycle", "motorcycle", "scooter", "ride", "hike", "sports", "football", "cricket"]):
        category = "sports"
        if rain_prob >= 70 or rain_amount > 4:
            risk_level = "high"
            decision = "Outdoor activity is not advised without rain protection."
            reason = f"High precipitation probability ({rain_prob}%) will cause wet roads and reduced visibility."
        elif max_wind >= 45:
            risk_level = "high"
            decision = "High winds make outdoor cycling or sports challenging."
            reason = f"Wind speeds reaching up to {round(max_wind)} km/h are expected."
        elif max_temp >= 36:
            risk_level = "moderate"
            decision = "Plan workouts in early morning or late evening."
            reason = f"Peak temperature reaching {round(max_temp)}°C may increase dehydration risk."
        elif rain_prob >= 40:
            risk_level = "moderate"
            decision = "Outdoor activity is feasible with caution."
            reason = f"Light showers are possible ({rain_prob}% chance). Check current radar before heading out."
        else:
            risk_level = "low"
            decision = "Great conditions for outdoor exercise and activities."
            reason = "Dry conditions, moderate temperatures, and manageable winds."

    # 3. Events, Outings, Picnics, Weddings
    elif any(w in message_lower for w in ["event", "picnic", "party", "gathering", "wedding", "outing", "trip", "barbecue", "bbq"]):
        category = "event"
        if rain_prob >= 60 or max_wind >= 40:
            risk_level = "high"
            decision = "Have an indoor backup plan ready for your event."
            reason = f"Risk of rain ({rain_prob}%) and wind up to {round(max_wind)} km/h could disrupt open-air setups."
        elif rain_prob >= 35:
            risk_level = "moderate"
            decision = "Outdoor event is viable; covered canopy recommended."
            reason = f"Scattered light precipitation is possible ({rain_prob}% chance)."
        else:
            risk_level = "low"
            decision = "Outdoor event conditions look excellent."
            reason = "Clear or stable skies with low chance of rain."

    # 4. Clothing / What to wear
    elif any(w in message_lower for w in ["wear", "cloth", "jacket", "coat", "dress", "outfit"]):
        category = "clothing"
        if max_temp >= 30:
            decision = "Wear lightweight, breathable summer attire and sunglasses."
            reason = f"Warm temperatures up to {round(max_temp)}°C expected."
        elif max_temp >= 20:
            decision = "Comfortable everyday clothing (T-shirt/light shirt with pants)."
            reason = f"Pleasant daytime high of {round(max_temp)}°C."
        elif max_temp >= 12:
            decision = "Dress in layers; a light jacket or cardigan is recommended."
            reason = f"Mild to cool conditions with highs around {round(max_temp)}°C."
        else:
            decision = "Wear a warm winter jacket, layers, and closed shoes."
            reason = f"Cold weather with temperatures hovering around {round(min_temp)}°C to {round(max_temp)}°C."

    # 5. General / Default Fallback
    else:
        if rain_prob >= 70 or rain_amount > 5:
            risk_level = "high"
            decision = "Prepare for wet conditions and potential travel delays."
            reason = f"Significant rain probability ({rain_prob}%) detected in upcoming hours."
        elif rain_prob >= 40:
            risk_level = "moderate"
            decision = "Keep rain protection handy."
            reason = f"Moderate chance of rain ({rain_prob}%) in the forecast."

    return {
        "decision": decision,
        "reason": reason,
        "risk_level": risk_level,
        "category": category,
        "rain_probability_next_hours": rain_prob,
        "rain_amount_next_hours": rain_amount,
        "max_wind_next_hours": max_wind,
        "temp_range_next_hours": [min_temp, max_temp]
    }