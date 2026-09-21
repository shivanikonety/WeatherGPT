import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestEdgeCases(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_invalid_city_geocoding(self):
        r = self.client.post("/geocode", json={"name": "xyznonexistentplace99999"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data.get("results"), [])

    def test_invalid_coordinates_validation(self):
        # Latitude out of bounds (> 90)
        r = self.client.post("/weather/current", json={"latitude": 150.0, "longitude": 0.0})
        self.assertEqual(r.status_code, 422)  # Pydantic validation error

    def test_imperial_units_conversion(self):
        r = self.client.post("/weather/current", json={"latitude": 40.7128, "longitude": -74.0060, "units": "imperial"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data.get("units"), "imperial")
        self.assertIn("temperature_f", data)
        self.assertIn("wind_speed_mph", data)
        temp_c = data["temperature"]
        temp_f = data["temperature_f"]
        self.assertAlmostEqual(temp_f, round((temp_c * 9/5) + 32, 1), places=1)

    def test_comparison_invalid_offsets(self):
        r = self.client.post("/weather/compare", json={"latitude": 40.7128, "longitude": -74.0060, "day1_offset": 0, "day2_offset": 20})
        self.assertEqual(r.status_code, 422)  # Pydantic validation error (le=14)

    def test_natural_search_comparison_intent(self):
        r = self.client.post("/weather/natural-search", json={"query": "Paris vs Berlin"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data.get("mode"), "comparison")
        self.assertEqual(str(data.get("parsed", {}).get("location1", "")).lower(), "paris")
        self.assertEqual(str(data.get("parsed", {}).get("location2", "")).lower(), "berlin")

    def test_empty_string_validation(self):
        r = self.client.post("/chat", json={"message": "", "latitude": 0, "longitude": 0})
        self.assertEqual(r.status_code, 422)

    def test_languages_endpoint(self):
        r = self.client.get("/languages")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("languages", data)
        self.assertEqual(len(data["languages"]), 11)


if __name__ == "__main__":
    unittest.main()
