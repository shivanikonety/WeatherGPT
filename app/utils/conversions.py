"""
Unit conversion utilities for WeatherGPT.
Ensures accurate conversion between Metric and Imperial systems.
"""

def celsius_to_fahrenheit(celsius: float) -> float:
    if celsius is None:
        return None
    return round((celsius * 9 / 5) + 32, 1)


def fahrenheit_to_celsius(fahrenheit: float) -> float:
    if fahrenheit is None:
        return None
    return round((fahrenheit - 32) * 5 / 9, 1)


def kmh_to_mph(kmh: float) -> float:
    if kmh is None:
        return None
    return round(kmh * 0.621371, 1)


def mm_to_inches(mm: float) -> float:
    if mm is None:
        return None
    return round(mm * 0.0393701, 2)


def format_temp(val: float, unit: str = "metric") -> str:
    if val is None:
        return "--"
    if unit == "imperial":
        f = celsius_to_fahrenheit(val)
        return f"{f}°F"
    return f"{round(val, 1)}°C"


def format_wind(val: float, unit: str = "metric") -> str:
    if val is None:
        return "--"
    if unit == "imperial":
        mph = kmh_to_mph(val)
        return f"{mph} mph"
    return f"{round(val, 1)} km/h"


def format_precipitation(val: float, unit: str = "metric") -> str:
    if val is None:
        return "0 mm"
    if unit == "imperial":
        inches = mm_to_inches(val)
        return f"{inches} in"
    return f"{round(val, 1)} mm"
