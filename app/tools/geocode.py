import httpx

from app.config import settings


async def geocode_place(name: str):
    if not name.strip():
        raise ValueError("Place name cannot be empty.")

    params = {
        "name": name,
        "count": 5,
        "language": "en",
        "format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                settings.open_meteo_geocoding_url,
                params=params
            )
            response.raise_for_status()
            data = response.json()

        results = data.get("results", [])

        if not results:
            return {
                "query": name,
                "results": []
            }

        locations = []

        for place in results:
            locations.append({
                "name": place.get("name"),
                "latitude": place.get("latitude"),
                "longitude": place.get("longitude"),
                "country": place.get("country"),
                "state": place.get("admin1"),
                "district": place.get("admin2"),
                "timezone": place.get("timezone"),
            })

        return {
            "query": name,
            "results": locations
        }

    except httpx.TimeoutException:
        raise Exception("Geocoding API request timed out.")

    except httpx.HTTPError as e:
        raise Exception(f"Geocoding API request failed: {str(e)}")

    except Exception as e:
        raise Exception(f"Geocoding failed: {str(e)}")