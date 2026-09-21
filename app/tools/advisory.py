"""
Weather Impact Advisor Engine for WeatherGPT.
Translates raw meteorological variables into real-world human impacts:
activities, clothing, travel, umbrella requirement, and comfort indices.
"""
from typing import Dict, Any, Optional


def generate_weather_impact(
    current: Dict[str, Any],
    forecast: Optional[Dict[str, Any]] = None,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Computes a comprehensive practical impact report for everyday decisions.
    """
    temp = current.get("temperature", 20.0)
    feels_like = current.get("feels_like", temp)
    humidity = current.get("humidity", 50)
    wind_speed = current.get("wind_speed", 10.0)
    wind_gusts = current.get("wind_gusts", wind_speed)
    precip = current.get("precipitation", 0.0)
    uv_index = current.get("uv_index", 0.0)
    uv_max = current.get("uv_index_max", uv_index)
    weather_code = current.get("weather_code", 0)

    # Inspect forecast hourly data if available
    hourly = forecast.get("hourly", {}) if forecast else {}
    precip_probs = hourly.get("precipitation_probability", [])
    hourly_precips = hourly.get("precipitation", [])
    hourly_winds = hourly.get("wind_speed_10m", [])
    hourly_times = hourly.get("time", [])

    # Next 12 hours rain analysis
    next_12h_probs = precip_probs[:12] if precip_probs else [int(precip > 0.2) * 80]
    next_12h_precip = hourly_precips[:12] if hourly_precips else [precip]
    max_rain_prob = max(next_12h_probs, default=0)
    sum_rain_12h = sum(next_12h_precip) if next_12h_precip else precip

    # 1. Umbrella Recommendation
    if max_rain_prob >= 70 or precip > 1.0 or sum_rain_12h > 3.0:
        umbrella_verdict = "Definite Yes"
        umbrella_needed = True
        umbrella_reason = f"High precipitation probability ({max_rain_prob}%) with notable rainfall expected."
    elif max_rain_prob >= 35 or precip > 0.0:
        umbrella_verdict = "Recommended (Keep Handy)"
        umbrella_needed = True
        umbrella_reason = f"Moderate chance of rain ({max_rain_prob}%). Carrying an umbrella is advised to avoid surprises."
    else:
        umbrella_verdict = "Not Needed"
        umbrella_needed = False
        umbrella_reason = f"Low chance of precipitation ({max_rain_prob}%). Dry weather expected."

    # Identify rain window if available
    rain_window = "No significant rain expected"
    if max_rain_prob >= 40 and hourly_times:
        rainy_hours = []
        for i, prob in enumerate(next_12h_probs):
            if prob >= 40 and i < len(hourly_times):
                t_str = hourly_times[i].split("T")[-1] if "T" in hourly_times[i] else str(i)
                rainy_hours.append(t_str)
        if rainy_hours:
            rain_window = f"Rain likely around {rainy_hours[0]} – {rainy_hours[-1]}"

    # 2. Clothing Suggestions
    clothing_items = []
    accessories = []

    if feels_like >= 30:
        clothing_summary = "Very warm conditions. Choose lightweight, breathable fabrics (cotton/linen) and loose-fitting attire."
        clothing_layers = "Single light layer"
        clothing_items = ["Breathable T-Shirt / Shorts", "Light Dress", "Open Footwear"]
    elif feels_like >= 22:
        clothing_summary = "Pleasantly warm. Standard comfortable casual clothing is ideal."
        clothing_layers = "Single comfortable layer"
        clothing_items = ["Short sleeves", "Chinos / Jeans", "Comfortable sneakers"]
    elif feels_like >= 15:
        clothing_summary = "Mild but breezy. A light cardigan, windbreaker, or overshirt is recommended."
        clothing_layers = "Light 2-layer setup"
        clothing_items = ["Long sleeve shirt", "Light jacket / cardigan", "Pants"]
    elif feels_like >= 7:
        clothing_summary = "Cool to brisk. Wear a warm jacket, fleece, or sweater."
        clothing_layers = "Moderate 2–3 layers"
        clothing_items = ["Warm sweater", "Medium jacket", "Long trousers"]
    else:
        clothing_summary = "Cold conditions. Dress in thermal base layers, heavy coat, and insulated footwear."
        clothing_layers = "Heavy insulated layers"
        clothing_items = ["Thermal inner", "Heavy winter coat", "Warm boots"]

    if uv_max >= 6:
        accessories.extend(["Sunglasses", "Wide-brim hat", "Sunscreen (SPF 30+)"])
    if umbrella_needed:
        accessories.append("Compact Umbrella")
    if wind_gusts > 45:
        accessories.append("Wind-resistant outerwear")
    if feels_like < 5:
        accessories.extend(["Beanie / Scarf", "Gloves"])

    # 3. Outdoor Activity Scores (0-100)
    # Running / Jogging Score
    running_score = 100
    if temp > 28 or feels_like > 32:
        running_score -= 30
    elif temp < 5:
        running_score -= 25
    if humidity > 80 and temp > 25:
        running_score -= 20
    if max_rain_prob > 50:
        running_score -= (max_rain_prob - 30)
    if wind_speed > 30:
        running_score -= 25
    running_score = max(10, min(100, running_score))

    # Cycling Score
    cycling_score = 100
    if wind_speed > 35 or wind_gusts > 50:
        cycling_score -= 40
    elif wind_speed > 20:
        cycling_score -= 15
    if max_rain_prob > 40:
        cycling_score -= 35
    if temp < 2 or temp > 35:
        cycling_score -= 25
    cycling_score = max(10, min(100, cycling_score))

    # Outdoor Dining / Patio Score
    dining_score = 100
    if max_rain_prob > 30 or precip > 0.1:
        dining_score -= 50
    if wind_speed > 25:
        dining_score -= 30
    if temp < 16 or temp > 33:
        dining_score -= 25
    dining_score = max(10, min(100, dining_score))

    # Walking / Commuting Score
    walking_score = 100
    if max_rain_prob > 60:
        walking_score -= 35
    if temp > 36 or temp < 0:
        walking_score -= 30
    if wind_speed > 40:
        walking_score -= 25
    walking_score = max(10, min(100, walking_score))

    def get_status(score: int) -> str:
        if score >= 80:
            return "Excellent"
        if score >= 60:
            return "Good"
        if score >= 40:
            return "Fair"
        return "Poor"

    # 4. Travel Comfort
    travel_score = 100
    road_condition = "Dry & Normal"
    if precip > 2.0 or max_rain_prob > 70:
        travel_score -= 35
        road_condition = "Wet & Slippery"
    elif precip > 0.0 or max_rain_prob > 40:
        travel_score -= 15
        road_condition = "Damp / Occasional spray"
    if wind_gusts > 50:
        travel_score -= 25
    if weather_code in (45, 48):
        travel_score -= 40
        road_condition = "Low Visibility / Fog"

    travel_score = max(15, min(100, travel_score))
    travel_status = "Smooth" if travel_score >= 75 else ("Caution Advised" if travel_score >= 50 else "Challenging")

    # 5. Hydration and Sun Health
    hydration_advice = "Standard fluid intake (1.5–2L/day)."
    if feels_like >= 32 or (humidity > 70 and temp > 28):
        hydration_advice = "High water intake recommended. Drink water regularly and replenish electrolytes if active outdoors."
    elif temp > 26:
        hydration_advice = "Moderate water intake. Keep a water bottle accessible during outdoor travel."

    # 6. Outdoor Laundry Drying Index
    drying_speed = "Fast (2–3 hrs)"
    if precip > 0.2 or max_rain_prob >= 50:
        drying_speed = "Not recommended outdoors (Rain risk)"
    elif humidity > 80:
        drying_speed = "Slow (5+ hrs)"
    elif temp < 12:
        drying_speed = "Moderate (4–5 hrs)"

    return {
        "umbrella": {
            "needed": umbrella_needed,
            "verdict": umbrella_verdict,
            "recommendation": umbrella_verdict,
            "reason": umbrella_reason,
            "rain_window": rain_window,
            "rain_probability": max_rain_prob,
        },
        "clothing": {
            "summary": clothing_summary,
            "layers": clothing_layers,
            "suggested_items": clothing_items,
            "accessories": accessories,
        },
        "activities": {
            "running": {
                "score": running_score,
                "status": get_status(running_score),
                "tip": "Optimal in early morning or evening" if temp > 28 else "Great conditions for outdoor run"
            },
            "cycling": {
                "score": cycling_score,
                "status": get_status(cycling_score),
                "tip": f"Watch for wind gusts up to {round(wind_gusts)} km/h" if wind_gusts > 30 else "Smooth cycling conditions"
            },
            "outdoor_dining": {
                "score": dining_score,
                "status": get_status(dining_score),
                "tip": "Indoor seating suggested if rain develops" if max_rain_prob > 40 else "Pleasant patio weather"
            },
            "walking": {
                "score": walking_score,
                "status": get_status(walking_score),
                "tip": "Comfortable for a walk" if walking_score >= 60 else "Take necessary weather precautions"
            }
        },
        "travel": {
            "score": travel_score,
            "status": travel_status,
            "road_condition": road_condition,
            "driving_tip": "Keep safe braking distance on wet surfaces." if "Wet" in road_condition else "Normal road traction expected."
        },
        "health": {
            "hydration": hydration_advice,
            "uv_advice": f"Peak UV is {round(uv_max, 1)}. " + ("Apply SPF 30+ sun protection." if uv_max >= 5 else "Low sun hazard."),
            "thermal_feel": f"Feels like {round(feels_like, 1)}°C with {humidity}% relative humidity.",
        },
        "home_and_life": {
            "laundry_drying": drying_speed
        },
        "source": "WeatherGPT Impact Intelligence"
    }


def generate_advisory(weather: dict) -> dict:
    """
    Backward-compatible advisory wrapper maintaining original endpoint contract
    while enriching with practical impact guidance.
    """
    advice = []
    temp = weather.get("temperature")
    humidity = weather.get("humidity")
    precip = weather.get("precipitation")
    wind = weather.get("wind_speed")

    if precip is not None and precip > 5:
        advice.append("Heavy precipitation is possible. Avoid spraying pesticides or fertilizers and postpone outdoor painting.")
    elif precip is not None and precip > 0.5:
        advice.append("Light to moderate rain detected. Keep protective rain gear accessible.")

    if temp is not None and temp > 35:
        advice.append("High temperature detected. Monitor hydration and crop/plant moisture requirements.")
    elif temp is not None and temp < 3:
        advice.append("Cold temperature detected. Protect sensitive plants and check heating systems.")

    if humidity is not None and humidity < 30:
        advice.append("Low humidity detected. Check plants and skin for moisture stress.")
    elif humidity is not None and humidity > 85:
        advice.append("High humidity detected. Good conditions for indoor dehumidification.")

    if wind is not None and wind > 35:
        advice.append(f"Strong winds reaching {round(wind)} km/h detected. Secure loose outdoor fixtures.")

    if not advice:
        advice.append("Weather conditions look relatively stable. Enjoy your daily routine with regular weather monitoring.")

    # Generate full impact model as well
    impact = generate_weather_impact(weather)

    return {
        "advisory": advice,
        "summary": " ".join(advice),
        "impact": impact,
        "source": "WeatherGPT Rule-Based Advisory"
    }