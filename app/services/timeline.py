"""
Weather Timeline Intelligence Service for WeatherGPT.
Segments forecast data into human diurnal phases (Morning, Afternoon, Evening, Night)
and generates 24-hour interactive hourly progressions.
"""
from typing import Dict, Any, List
from app.utils.weather_codes import get_weather_info
from app.utils.conversions import celsius_to_fahrenheit, kmh_to_mph, mm_to_inches


def generate_timeline(
    forecast: Dict[str, Any],
    days: int = 2,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Constructs diurnal phase breakdowns and hourly scrubber sequences.
    """
    hourly = forecast.get("hourly", {})
    times = hourly.get("time", [])
    temps = hourly.get("temperature_2m", [])
    feels = hourly.get("apparent_temperature", [])
    precip_probs = hourly.get("precipitation_probability", [])
    precips = hourly.get("precipitation", [])
    weather_codes = hourly.get("weather_code", [])
    wind_speeds = hourly.get("wind_speed_10m", [])
    uv_indices = hourly.get("uv_index", [])
    is_days = hourly.get("is_day", [])

    if not times:
        return {"phases": [], "hourly_24h": [], "summary": "Forecast timeline unavailable."}

    # Build 24-hour hourly items
    hourly_24h = []
    limit = min(24 * days, len(times))
    for i in range(min(24, len(times))):
        code = weather_codes[i] if i < len(weather_codes) else 0
        w_info = get_weather_info(code)
        t_c = temps[i] if i < len(temps) else None
        f_c = feels[i] if i < len(feels) else None
        p_prob = precip_probs[i] if i < len(precip_probs) else 0
        p_amount = precips[i] if i < len(precips) else 0.0
        w_spd = wind_speeds[i] if i < len(wind_speeds) else 0.0
        uv = uv_indices[i] if i < len(uv_indices) else 0.0
        day_flag = bool(is_days[i]) if i < len(is_days) else True

        # Extract hour string "14:00"
        time_str = times[i].split("T")[-1] if "T" in times[i] else times[i]

        hourly_24h.append({
            "time": times[i],
            "hour_label": time_str,
            "temp": t_c,
            "temp_f": celsius_to_fahrenheit(t_c),
            "feels_like": f_c,
            "feels_like_f": celsius_to_fahrenheit(f_c),
            "precipitation_probability": p_prob,
            "precipitation_amount": p_amount,
            "precipitation_amount_in": mm_to_inches(p_amount),
            "weather_code": code,
            "description": w_info["description"],
            "icon": w_info["icon"],
            "wind_speed": w_spd,
            "wind_speed_mph": kmh_to_mph(w_spd),
            "uv_index": uv,
            "is_day": day_flag
        })

    # Segment today's hours into 4 Diurnal Phases
    # Morning: 06:00 - 11:59 (hours 6..11)
    # Afternoon: 12:00 - 17:59 (hours 12..17)
    # Evening: 18:00 - 21:59 (hours 18..21)
    # Night: 22:00 - 05:59 (hours 22..23 + 0..5)
    
    phases_config = [
        {"id": "morning", "label": "Morning", "range_hours": list(range(6, 12)), "icon_fallback": "sun-cloud"},
        {"id": "afternoon", "label": "Afternoon", "range_hours": list(range(12, 18)), "icon_fallback": "sun"},
        {"id": "evening", "label": "Evening", "range_hours": list(range(18, 22)), "icon_fallback": "cloud-sun"},
        {"id": "night", "label": "Overnight", "range_hours": list(range(22, 24)) + list(range(0, 6)), "icon_fallback": "moon"}
    ]

    phases = []
    for cfg in phases_config:
        phase_indices = []
        for idx in range(min(24, len(times))):
            try:
                hour = int(times[idx].split("T")[-1].split(":")[0])
                if hour in cfg["range_hours"]:
                    phase_indices.append(idx)
            except Exception:
                pass

        if phase_indices:
            p_temps = [temps[i] for i in phase_indices if i < len(temps) and temps[i] is not None]
            p_probs = [precip_probs[i] for i in phase_indices if i < len(precip_probs) and precip_probs[i] is not None]
            p_codes = [weather_codes[i] for i in phase_indices if i < len(weather_codes) and weather_codes[i] is not None]
            p_winds = [wind_speeds[i] for i in phase_indices if i < len(wind_speeds) and wind_speeds[i] is not None]

            min_t = min(p_temps) if p_temps else None
            max_t = max(p_temps) if p_temps else None
            avg_t = sum(p_temps) / len(p_temps) if p_temps else None
            max_prob = max(p_probs) if p_probs else 0
            max_w = max(p_winds) if p_winds else 0

            # Find dominant or worst weather code in phase
            dominant_code = max(set(p_codes), key=p_codes.count) if p_codes else 0
            w_meta = get_weather_info(dominant_code)

            # Generate Phase Description
            desc_parts = []
            if max_prob >= 60:
                desc_parts.append(f"Rain likely ({max_prob}%)")
            elif max_prob >= 30:
                desc_parts.append(f"Possible showers ({max_prob}%)")
            else:
                desc_parts.append(w_meta["description"])

            if max_w > 30:
                desc_parts.append("breezy")

            phase_desc = ", ".join(desc_parts).capitalize()

            phases.append({
                "id": cfg["id"],
                "label": cfg["label"],
                "time_range": f"{cfg['range_hours'][0]:02d}:00 – {cfg['range_hours'][-1]:02d}:00",
                "temp_min": round(min_t, 1) if min_t is not None else None,
                "temp_max": round(max_t, 1) if max_t is not None else None,
                "temp_min_f": celsius_to_fahrenheit(min_t),
                "temp_max_f": celsius_to_fahrenheit(max_t),
                "temp_avg": round(avg_t, 1) if avg_t is not None else None,
                "precipitation_probability": max_prob,
                "weather_code": dominant_code,
                "icon": w_meta["icon"],
                "condition": w_meta["description"],
                "summary": phase_desc,
                "max_wind": round(max_w, 1)
            })

    # High-level diurnal narrative
    summary_sentences = []
    if phases:
        morning = next((p for p in phases if p["id"] == "morning"), None)
        afternoon = next((p for p in phases if p["id"] == "afternoon"), None)
        evening = next((p for p in phases if p["id"] == "evening"), None)
        
        if morning and afternoon:
            summary_sentences.append(f"Morning starts around {morning['temp_min']}°C to {morning['temp_max']}°C ({morning['condition']}), warming to a peak near {afternoon['temp_max']}°C in the afternoon.")
        if evening:
            if evening['precipitation_probability'] >= 40:
                summary_sentences.append(f"Rain chances increase to {evening['precipitation_probability']}% towards the evening.")
            else:
                summary_sentences.append(f"Evening remains pleasant near {evening['temp_avg']}°C under {evening['condition'].lower()}.")

    narrative = " ".join(summary_sentences) if summary_sentences else "Timeline progression shows steady meteorological conditions."

    return {
        "phases": phases,
        "hourly_24h": hourly_24h,
        "hourly": hourly_24h,
        "summary": narrative,
        "source": "WeatherGPT Timeline Intelligence"
    }
