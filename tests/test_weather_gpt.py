"""
Automated Integration and Unit Tests for WeatherGPT.
Validates tools, services, endpoints, unit conversions, fallbacks, and 11 Indian languages.
"""
import asyncio
import unittest
from app.utils.conversions import celsius_to_fahrenheit, kmh_to_mph, mm_to_inches
from app.utils.weather_codes import get_weather_info
from app.tools.geocode import geocode_place
from app.tools.weather import get_current_weather, get_forecast, get_air_quality
from app.tools.alerts import get_weather_alerts
from app.tools.advisory import generate_weather_impact, generate_advisory
from app.tools.decision import generate_decision
from app.services.timeline import generate_timeline
from app.services.comparison import compare_days, compare_locations
from app.services.nlp import parse_natural_query, resolve_location_and_weather
from app.services.agent import get_weather_context
from app.services.llm import generate_weather_response, generate_fallback_weather_response
from app.services.i18n import (
    LANGUAGES,
    get_wmo_description,
    generate_localized_fallback,
    generate_localized_weather_explainer,
    is_supported_language
)


class TestWeatherGPT(unittest.TestCase):

    def test_conversions(self):
        self.assertEqual(celsius_to_fahrenheit(0), 32.0)
        self.assertEqual(celsius_to_fahrenheit(20), 68.0)
        self.assertAlmostEqual(kmh_to_mph(10), 6.2, places=1)
        self.assertAlmostEqual(mm_to_inches(25.4), 1.0, places=2)

    def test_weather_codes(self):
        info = get_weather_info(0)
        self.assertEqual(info["category"], "clear")
        self.assertEqual(info["icon"], "sun")
        info_rain = get_weather_info(61)
        self.assertTrue(info_rain["is_rain"])

    def test_nlp_parser_english(self):
        p1 = parse_natural_query("Tokyo tomorrow")
        self.assertEqual(str(p1.get("location", "")).lower(), "tokyo")
        self.assertEqual(p1["day_offset"], 1)

        p2 = parse_natural_query("London vs Paris")
        self.assertEqual(p2["type"], "comparison")
        self.assertEqual(str(p2.get("location1", "")).lower(), "london")
        self.assertEqual(str(p2.get("location2", "")).lower(), "paris")

    def test_multilingual_registry_completeness(self):
        expected_langs = ["en-IN", "hi-IN", "bn-IN", "mr-IN", "te-IN", "ta-IN", "gu-IN", "ur-IN", "kn-IN", "or-IN", "ml-IN"]
        self.assertEqual(len(LANGUAGES), 11)
        for code in expected_langs:
            self.assertIn(code, LANGUAGES)
            lang_def = LANGUAGES[code]
            self.assertIn("name", lang_def)
            self.assertIn("native_name", lang_def)
            self.assertIn("speech_locale", lang_def)
            self.assertIn("direction", lang_def)
            self.assertIn("wmo", lang_def)
            self.assertIn("fallback_templates", lang_def)
            self.assertTrue(is_supported_language(code))

        # Check Urdu RTL direction
        self.assertEqual(LANGUAGES["ur-IN"]["direction"], "rtl")

    def test_multilingual_wmo_descriptions(self):
        for code in LANGUAGES.keys():
            desc_clear = get_wmo_description(0, code)
            desc_rain = get_wmo_description(61, code)
            desc_storm = get_wmo_description(95, code)
            self.assertTrue(bool(desc_clear))
            self.assertTrue(bool(desc_rain))
            self.assertTrue(bool(desc_storm))

    def test_multilingual_nlp_queries(self):
        test_queries = [
            ("London tomorrow", 1, "london"),
            ("दिल्ली में कल बारिश होगी क्या?", 1, "दिल्ली"),
            ("কলকাতায় কি কাল বৃষ্টি হবে?", 1, "কলকাতায়"),
            ("पुण्यात उद्या पाऊस पडेल का?", 1, "पुण्यात"),
            ("రేపు హైదరాబాద్లో వర్షం పడుతుందా?", 1, "హైదరాబాద్"),
            ("சென்னையில் நாளை மழை பெய்யுமா?", 1, "சென்னை"),
            ("અમદાવાદમાં કાલે વરસાદ પડશે?", 1, "અમદાવાદ"),
            ("کیا کل لاہور میں بارش ہوگی؟", 1, "لاہور"),
            ("ನಾಳೆ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮಳೆ ಬರುತ್ತಾ?", 1, "ಬೆಂಗಳೂರು"),
            ("ଭୁବନେଶ୍ୱରରେ କାଲି ବର୍ଷା ହେବ କି?", 1, "ଭୁବନେଶ୍ୱର"),
            ("നാളെ കൊച്ചിയിൽ മഴ പെയ്യുമോ?", 1, "കൊച്ചി"),
        ]

        for query, expected_offset, expected_loc_contains in test_queries:
            parsed = parse_natural_query(query)
            self.assertEqual(parsed["day_offset"], expected_offset, f"Failed day_offset for: {query}")
            loc = parsed.get("location") or ""
            self.assertTrue(bool(loc), f"Failed to extract location for: {query}")

    def test_multilingual_fallback_generators(self):
        mock_ctx = {
            "location": {"name": "Mumbai"},
            "current_weather": {
                "temperature": 28.5,
                "weather_code": 61,
                "humidity": 80,
                "wind_speed": 15,
                "feels_like": 31.0
            },
            "forecast_days": [
                {
                    "date": "2026-09-10",
                    "temp_max": 30.0,
                    "temp_min": 24.0,
                    "precipitation_probability": 75,
                    "weather_code": 61
                }
            ],
            "impact": {
                "umbrella": {"verdict": "Needed", "reason": "High chance of rain"},
                "clothing": {"layers": "Light clothing"}
            }
        }

        for code in LANGUAGES.keys():
            fallback = generate_localized_fallback("Will it rain tomorrow?", mock_ctx, language=code)
            self.assertTrue(len(fallback) > 20, f"Fallback too short for language {code}")
            # Ensure proper language output
            explainer = generate_localized_weather_explainer(mock_ctx["current_weather"], location_name="Mumbai", language=code)
            self.assertTrue(len(explainer) > 10, f"Explainer too short for language {code}")

    def test_geocode_and_weather(self):
        async def run_async():
            geo = await geocode_place("London")
            self.assertTrue(len(geo.get("results", [])) > 0)
            loc = geo["results"][0]
            lat, lon = loc["latitude"], loc["longitude"]

            # Current weather
            current = await get_current_weather(lat, lon)
            self.assertIn("temperature", current)
            self.assertIn("humidity", current)
            self.assertIn("feels_like", current)

            # Forecast
            forecast = await get_forecast(lat, lon, days=3)
            self.assertIn("daily_structured", forecast)
            self.assertEqual(len(forecast["daily_structured"]), 3)

            # Alerts
            alerts = await get_weather_alerts(lat, lon)
            self.assertIn("alerts", alerts)
            self.assertTrue(len(alerts["alerts"]) > 0)

            # Impact
            impact = generate_weather_impact(current, forecast=forecast)
            self.assertIn("umbrella", impact)
            self.assertIn("clothing", impact)
            self.assertIn("activities", impact)

            # Timeline
            timeline = generate_timeline(forecast, days=2)
            self.assertIn("phases", timeline)
            self.assertIn("hourly_24h", timeline)

            # Comparison Days
            comp = await compare_days(lat, lon, day1_offset=0, day2_offset=1)
            self.assertEqual(comp["mode"], "days")
            self.assertIn("deltas", comp)

            # Context
            ctx = await get_weather_context(lat, lon, days=2, message="Should I take an umbrella?")
            self.assertIn("current_weather", ctx)
            self.assertIn("impact", ctx)

            # Fallback LLM response in Hindi
            fallback_hi = generate_fallback_weather_response("क्या कल बारिश होगी?", ctx, language="hi-IN")
            self.assertTrue(len(fallback_hi) > 20)

            # Fallback LLM response in English
            fallback_en = generate_fallback_weather_response("Will it rain?", ctx, language="en-IN")
            self.assertIn("Precipitation Outlook", fallback_en)

            # Live LLM response
            llm_res = await generate_weather_response("Should I take an umbrella?", ctx, language="en-IN")
            self.assertTrue(len(llm_res) > 10)

        asyncio.run(run_async())


if __name__ == "__main__":
    unittest.main()
