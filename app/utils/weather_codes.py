WEATHER_METADATA = {
    0: {"description": "Clear sky", "icon": "sun", "category": "clear", "is_rain": False, "is_severe": False},
    1: {"description": "Mainly clear", "icon": "sun-cloud", "category": "clear", "is_rain": False, "is_severe": False},
    2: {"description": "Partly cloudy", "icon": "cloud-sun", "category": "clouds", "is_rain": False, "is_severe": False},
    3: {"description": "Overcast", "icon": "cloud", "category": "clouds", "is_rain": False, "is_severe": False},
    45: {"description": "Foggy", "icon": "fog", "category": "fog", "is_rain": False, "is_severe": False},
    48: {"description": "Depositing rime fog", "icon": "fog", "category": "fog", "is_rain": False, "is_severe": False},
    51: {"description": "Light drizzle", "icon": "cloud-drizzle", "category": "drizzle", "is_rain": True, "is_severe": False},
    53: {"description": "Moderate drizzle", "icon": "cloud-drizzle", "category": "drizzle", "is_rain": True, "is_severe": False},
    55: {"description": "Dense drizzle", "icon": "cloud-rain", "category": "drizzle", "is_rain": True, "is_severe": False},
    56: {"description": "Light freezing drizzle", "icon": "cloud-snow", "category": "winter", "is_rain": True, "is_severe": False},
    57: {"description": "Dense freezing drizzle", "icon": "cloud-snow", "category": "winter", "is_rain": True, "is_severe": False},
    61: {"description": "Slight rain", "icon": "cloud-rain", "category": "rain", "is_rain": True, "is_severe": False},
    63: {"description": "Moderate rain", "icon": "cloud-rain", "category": "rain", "is_rain": True, "is_severe": False},
    65: {"description": "Heavy rain", "icon": "cloud-lightning-rain", "category": "rain", "is_rain": True, "is_severe": True},
    66: {"description": "Light freezing rain", "icon": "cloud-snow", "category": "winter", "is_rain": True, "is_severe": False},
    67: {"description": "Heavy freezing rain", "icon": "cloud-snow", "category": "winter", "is_rain": True, "is_severe": True},
    71: {"description": "Slight snow fall", "icon": "cloud-snow", "category": "snow", "is_rain": False, "is_severe": False},
    73: {"description": "Moderate snow fall", "icon": "cloud-snow", "category": "snow", "is_rain": False, "is_severe": False},
    75: {"description": "Heavy snow fall", "icon": "snowflake", "category": "snow", "is_rain": False, "is_severe": True},
    77: {"description": "Snow grains", "icon": "snowflake", "category": "snow", "is_rain": False, "is_severe": False},
    80: {"description": "Slight rain showers", "icon": "cloud-drizzle", "category": "rain", "is_rain": True, "is_severe": False},
    81: {"description": "Moderate rain showers", "icon": "cloud-rain", "category": "rain", "is_rain": True, "is_severe": False},
    82: {"description": "Violent rain showers", "icon": "cloud-lightning-rain", "category": "rain", "is_rain": True, "is_severe": True},
    85: {"description": "Slight snow showers", "icon": "cloud-snow", "category": "snow", "is_rain": False, "is_severe": False},
    86: {"description": "Heavy snow showers", "icon": "snowflake", "category": "snow", "is_rain": False, "is_severe": True},
    95: {"description": "Thunderstorm", "icon": "cloud-lightning", "category": "storm", "is_rain": True, "is_severe": True},
    96: {"description": "Thunderstorm with slight hail", "icon": "cloud-lightning", "category": "storm", "is_rain": True, "is_severe": True},
    99: {"description": "Thunderstorm with heavy hail", "icon": "cloud-lightning", "category": "storm", "is_rain": True, "is_severe": True},
}

WEATHER_CODES = {k: v["description"] for k, v in WEATHER_METADATA.items()}


def get_weather_description(code: int) -> str:
    return WEATHER_CODES.get(code, "Variable weather conditions")


def get_weather_info(code: int) -> dict:
    meta = WEATHER_METADATA.get(code)
    if meta:
        return {"code": code, **meta}
    return {
        "code": code,
        "description": "Variable conditions",
        "icon": "cloud",
        "category": "clouds",
        "is_rain": False,
        "is_severe": False,
    }