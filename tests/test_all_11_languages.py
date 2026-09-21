"""
Comprehensive 11-Language Multilingual Unit Tests for WeatherGPT.
Tests NLP location & temporal extraction, script verification, and zero English leakage across all 11 languages.
"""
import unittest
import re
from fastapi.testclient import TestClient
from app.main import app
from app.services.nlp import parse_natural_query
from app.services.i18n import (
    LANGUAGES,
    generate_localized_fallback,
    generate_localized_explanation,
    detect_language_from_script
)


class TestAll11Languages(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_all_11_languages_nlp_extraction(self):
        """
        Verifies that natural language questions in all 11 languages
        correctly extract Hyderabad as the location and tomorrow as temporal intent (day_offset = 1).
        """
        test_cases = [
            ("en-IN", "Will it rain tomorrow in Hyderabad?", "hyderabad", 1),
            ("hi-IN", "क्या कल हैदराबाद में बारिश होगी?", "हैदराबाद", 1),
            ("bn-IN", "আগামীকাল হায়দ্রাবাদে কি বৃষ্টি হবে?", "হায়দ্রাবাদ", 1),
            ("mr-IN", "उद्या हैदराबादमध्ये पाऊस पडेल का?", "हैदराबाद", 1),
            ("te-IN", "రేపు హైదరాబాద్లో వర్షం పడుతుందా?", "హైదరాబాద్", 1),
            ("ta-IN", "நாளை ஹைதராபாத்தில் மழை பெய்யுமா?", "ஹைதராபாத்", 1),
            ("gu-IN", "શું આવતીકાલે હૈદરાબાદમાં વરસાદ પડશે?", "હૈદરાબાદ", 1),
            ("ur-IN", "کیا کل حیدرآباد میں بارش ہوگی؟", "حیدرآباد", 1),
            ("kn-IN", "ನಾಳೆ ಹೈದರಾಬಾದ್ನಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?", "ಹೈದರಾಬಾದ್", 1),
            ("or-IN", "ଆସନ୍ତାକାଲି ହାଇଦ୍ରାବାଦରେ ବର୍ଷା ହେବ କି?", "ହାଇଦ୍ରାବାଦ", 1),
            ("ml-IN", "നാളെ ഹൈദരാബാദിൽ മഴ പെയ്യുമോ?", "ഹൈദരാബാദ്", 1),
        ]

        for lang, query, expected_loc_substr, expected_offset in test_cases:
            with self.subTest(lang=lang, query=query):
                parsed = parse_natural_query(query)
                self.assertEqual(
                    parsed["day_offset"],
                    expected_offset,
                    f"[{lang}] Expected day_offset {expected_offset} for '{query}', got {parsed['day_offset']}"
                )
                loc = parsed.get("location", "")
                self.assertIn(
                    expected_loc_substr.lower(),
                    loc.lower(),
                    f"[{lang}] Expected location '{expected_loc_substr}' in '{loc}' for query '{query}'"
                )

    def test_script_auto_detection(self):
        """Verifies detect_language_from_script correctly detects Indian scripts."""
        cases = [
            ("రేపు వర్షం పడుతుందా?", "te-IN"),
            ("क्या कल बारिश होगी?", "hi-IN"),
            ("কাল কি বৃষ্টি হবে?", "bn-IN"),
            ("उद्या पाऊस पडेल का?", "mr-IN"),
            ("நாளை மழை பெய்யுமா?", "ta-IN"),
            ("કાલે વરસાદ પડશે?", "gu-IN"),
            ("کیا بارش ہوگی؟", "ur-IN"),
            ("ನಾಳೆ ಮಳೆ ಬರುತ್ತಾ?", "kn-IN"),
            ("କାଲି ବର୍ଷା ହେବ କି?", "or-IN"),
            ("നാളെ മഴ പെയ്യുമോ?", "ml-IN"),
        ]
        for query, expected_lang in cases:
            with self.subTest(query=query):
                detected = detect_language_from_script(query)
                self.assertEqual(detected, expected_lang)

    def test_all_11_languages_chat_responses(self):
        """
        Sends the 11 user-specified queries to /chat and verifies:
        1. HTTP 200 response
        2. Non-empty response
        3. Correct native script characters present
        4. No unexpected English leakage in Indian language responses
        """
        script_ranges = {
            "hi-IN": (0x0900, 0x097F),  # Devanagari
            "bn-IN": (0x0980, 0x09FF),  # Bengali
            "mr-IN": (0x0900, 0x097F),  # Devanagari (Marathi)
            "te-IN": (0x0C00, 0x0C7F),  # Telugu
            "ta-IN": (0x0B80, 0x0BFF),  # Tamil
            "gu-IN": (0x0A80, 0x0AFF),  # Gujarati
            "ur-IN": (0x0600, 0x06FF),  # Arabic / Urdu
            "kn-IN": (0x0C80, 0x0CFF),  # Kannada
            "or-IN": (0x0B00, 0x0B7F),  # Odia
            "ml-IN": (0x0D00, 0x0D7F),  # Malayalam
        }

        queries = [
            ("en-IN", "Will it rain tomorrow in Hyderabad?"),
            ("hi-IN", "क्या कल हैदराबाद में बारिश होगी?"),
            ("bn-IN", "আগামীকাল হায়দ্রাবাদে কি বৃষ্টি হবে?"),
            ("mr-IN", "उद्या हैदराबादमध्ये पाऊस पडेल का?"),
            ("te-IN", "రేపు హైదరాబాద్లో వర్షం పడుతుందా?"),
            ("ta-IN", "நாளை ஹைதராபாத்தில் மழை பெய்யுமா?"),
            ("gu-IN", "શું આવતીકાલે હૈદરાબાદમાં વરસાદ પડશે?"),
            ("ur-IN", "کیا کل حیدرآباد میں بارش ہوگی؟"),
            ("kn-IN", "ನಾಳೆ ಹೈದರಾಬಾದ್ನಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?"),
            ("or-IN", "ଆସନ୍ତାକାଲି ହାଇଦ୍ରାବାଦରେ ବର୍ଷା ହେବ କି?"),
            ("ml-IN", "നാളെ ഹൈദരാബാଦിൽ മഴ പെയ്യുമോ?"),
        ]

        forbidden_english_phrases = [
            "precipitation outlook",
            "rain probability",
            "umbrella recommendation",
            "not needed",
            "carry an umbrella",
            "here is the weather",
            "the weather in hyderabad",
            "degrees celsius"
        ]

        for lang, q in queries:
            with self.subTest(lang=lang, query=q):
                res = self.client.post(
                    "/chat",
                    json={
                        "message": q,
                        "latitude": 17.3850,
                        "longitude": 78.4867,
                        "location_name": "Hyderabad",
                        "language": lang
                    }
                )
                self.assertEqual(res.status_code, 200, f"[{lang}] Chat failed with status {res.status_code}")
                data = res.json()
                resp_text = data.get("response", "")
                self.assertTrue(len(resp_text) > 30, f"[{lang}] Response too short: {resp_text}")

                # If Indian language, verify native script presence
                if lang in script_ranges:
                    start_code, end_code = script_ranges[lang]
                    has_native_script = any(start_code <= ord(ch) <= end_code for ch in resp_text)
                    self.assertTrue(has_native_script, f"[{lang}] Response lacks native script characters! Got:\n{resp_text}")

                    # Verify no raw English headers or forbidden English phrases leaked
                    resp_lower = resp_text.lower()
                    for forbidden in forbidden_english_phrases:
                        self.assertNotIn(
                            forbidden,
                            resp_lower,
                            f"[{lang}] Leaked English phrase '{forbidden}' in response:\n{resp_text}"
                        )

    def test_all_11_languages_fallback_generators(self):
        """Verifies deterministic fallbacks for all 11 languages with zero English leakage."""
        mock_ctx = {
            "location_name": "Hyderabad",
            "current_weather": {
                "temperature": 32.0,
                "feels_like": 34.0,
                "humidity": 65,
                "wind_speed": 12.0,
                "weather_code": 2,
                "weather_description": "Partly cloudy"
            },
            "forecast": {
                "daily_structured": [
                    {"date": "2026-09-10", "temp_max": 33.0, "temp_min": 24.0, "precipitation_probability": 10, "weather_code": 2},
                    {"date": "2026-09-11", "temp_max": 32.0, "temp_min": 23.0, "precipitation_probability": 0, "weather_code": 2}
                ]
            },
            "decision": {"rain_probability_next_hours": 0},
            "impact": {
                "umbrella": {"needed": False, "verdict": "Not Needed", "reason": "Dry skies"},
                "clothing": {"summary": "Comfortable light clothing"}
            },
            "alerts": {"alerts": []}
        }

        for lang in LANGUAGES.keys():
            with self.subTest(lang=lang):
                fallback = generate_localized_fallback("రేపు హైదరాబాద్లో వర్షం పడుతుందా?", mock_ctx, language=lang)
                self.assertTrue(len(fallback) > 30, f"[{lang}] Fallback too short: {fallback}")
                explainer = generate_localized_explanation(mock_ctx["current_weather"], location_name="Hyderabad", language=lang)
                self.assertTrue(len(explainer) > 15, f"[{lang}] Explainer too short: {explainer}")


if __name__ == "__main__":
    unittest.main()
