from pathlib import Path

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse

from app.config import settings

from app.services.agent import get_weather_context
from app.services.llm import (
    generate_weather_response,
    explain_weather_synthesizer,
)
from app.services.timeline import generate_timeline
from app.services.comparison import (
    compare_days,
    compare_locations,
)
from app.services.nlp import resolve_location_and_weather
from app.services.i18n import (
    LANGUAGES,
    detect_language_from_script,
)

from app.schemas.weather import (
    LocationQuery,
    ForecastQuery,
    GeocodeQuery,
    ChatQuery,
    ImpactQuery,
    TimelineQuery,
    ComparisonQuery,
    ExplainQuery,
    NaturalSearchQuery,
)

from app.tools.weather import (
    get_current_weather,
    get_forecast,
)

from app.tools.geocode import geocode_place
from app.tools.alerts import get_weather_alerts
from app.tools.advisory import (
    generate_advisory,
    generate_weather_impact,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Intelligent, accurate, and conversational "
        "AI Weather Intelligence Assistant."
    ),
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC FILES
# ============================================================

STATIC_DIR = (
    Path(__file__).resolve().parent / "static"
)

if STATIC_DIR.exists():
    app.mount(
        "/static",
        StaticFiles(
            directory=str(STATIC_DIR)
        ),
        name="static",
    )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root(request: Request):

    index_path = STATIC_DIR / "index.html"

    if index_path.exists():

        return FileResponse(
            str(index_path)
        )

    return {
        "message":
            f"Welcome to {settings.app_name} API",

        "version":
            settings.app_version,

        "docs_url":
            "/docs",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():

    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }


# ============================================================
# LANGUAGES
# ============================================================

@app.get("/languages")
async def get_supported_languages():

    return {
        "languages": LANGUAGES,
        "default": "en-IN",
        "count": len(LANGUAGES),
    }


# ============================================================
# 1. CORE WEATHER & GEOCODING
# ============================================================

@app.post("/weather/current")
async def current_weather(
    location: LocationQuery,
):

    try:

        units = (
            location.units
            or "metric"
        )

        weather = await get_current_weather(
            location.latitude,
            location.longitude,
            units=units,
        )

        return weather

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve current "
                f"weather: {str(e)}"
            ),
        )


@app.post("/weather/forecast")
async def weather_forecast(
    query: ForecastQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        forecast = await get_forecast(
            query.latitude,
            query.longitude,
            query.days,
            units=units,
        )

        return forecast

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve forecast: "
                f"{str(e)}"
            ),
        )


@app.post("/geocode")
async def geocode(
    query: GeocodeQuery,
):

    try:

        result = await geocode_place(
            query.name
        )

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Geocoding service error: "
                f"{str(e)}"
            ),
        )


@app.post("/weather/natural-search")
async def natural_search(
    query: NaturalSearchQuery,
):

    try:

        lang = (
            query.language
            or "en-IN"
        )

        result = await resolve_location_and_weather(
            query.query,
            language=lang,
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Natural search processing failed: "
                f"{str(e)}"
            ),
        )


# ============================================================
# 2. INTELLIGENCE & ADVISORY
# ============================================================

@app.post("/alerts")
async def weather_alerts(
    location: LocationQuery,
):

    try:

        alerts = await get_weather_alerts(
            location.latitude,
            location.longitude,
        )

        return alerts

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to evaluate weather alerts: "
                f"{str(e)}"
            ),
        )


@app.post("/advisory")
async def agriculture_advisory(
    location: LocationQuery,
):

    try:

        weather = await get_current_weather(
            location.latitude,
            location.longitude,
            units=(
                location.units
                or "metric"
            ),
        )

        advisory = generate_advisory(
            weather
        )

        return {
            "weather": weather,
            "advisory":
                advisory["advisory"],
            "impact":
                advisory.get("impact", {}),
            "source":
                advisory.get("source"),
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate advisory: "
                f"{str(e)}"
            ),
        )


@app.post("/weather/impact")
async def weather_impact(
    query: ImpactQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        weather = await get_current_weather(
            query.latitude,
            query.longitude,
            units=units,
        )

        forecast = await get_forecast(
            query.latitude,
            query.longitude,
            days=2,
            units=units,
        )

        impact = generate_weather_impact(
            weather,
            forecast=forecast,
            units=units,
        )

        return {
            "location":
                query.location_name
                or (
                    f"{query.latitude:.2f}, "
                    f"{query.longitude:.2f}"
                ),

            "impact": impact,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to compute weather impact: "
                f"{str(e)}"
            ),
        )


@app.post("/weather/timeline")
async def weather_timeline(
    query: TimelineQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        forecast = await get_forecast(
            query.latitude,
            query.longitude,
            days=query.days,
            units=units,
        )

        timeline = generate_timeline(
            forecast,
            days=query.days,
            units=units,
        )

        return timeline

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate weather timeline: "
                f"{str(e)}"
            ),
        )


@app.post("/weather/compare")
async def weather_comparison(
    query: ComparisonQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        if query.mode == "locations":

            if (
                not query.location1
                or not query.location2
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Both location1 and "
                        "location2 are required "
                        "for location comparison."
                    ),
                )

            return await compare_locations(
                loc1_name=
                    query.location1.name,

                loc1_lat=
                    query.location1.latitude,

                loc1_lon=
                    query.location1.longitude,

                loc2_name=
                    query.location2.name,

                loc2_lat=
                    query.location2.latitude,

                loc2_lon=
                    query.location2.longitude,

                units=units,
            )

        else:

            if (
                query.latitude is None
                or query.longitude is None
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Latitude and longitude "
                        "are required for days "
                        "comparison."
                    ),
                )

            return await compare_days(
                latitude=query.latitude,
                longitude=query.longitude,
                day1_offset=
                    query.day1_offset,
                day2_offset=
                    query.day2_offset,
                location_name=
                    query.location_name,
                units=units,
            )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Weather comparison failed: "
                f"{str(e)}"
            ),
        )


@app.post("/weather/explain")
async def explain_weather(
    query: ExplainQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        lang = (
            query.language
            or "en-IN"
        )

        weather = await get_current_weather(
            query.latitude,
            query.longitude,
            units=units,
        )

        forecast = await get_forecast(
            query.latitude,
            query.longitude,
            days=2,
            units=units,
        )

        impact = generate_weather_impact(
            weather,
            forecast=forecast,
            units=units,
        )

        explanation = (
            await explain_weather_synthesizer(
                current=weather,
                forecast=forecast,
                impact=impact,
                location_name=
                    query.location_name,
                language=lang,
            )
        )

        return {
            "location":
                query.location_name
                or (
                    f"{query.latitude:.2f}, "
                    f"{query.longitude:.2f}"
                ),

            "explanation":
                explanation,

            "current_weather":
                weather,

            "language":
                lang,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to explain weather: "
                f"{str(e)}"
            ),
        )


# ============================================================
# 3. CONVERSATIONAL AI WEATHER ASSISTANT
# ============================================================

@app.post("/chat")
async def chat(
    query: ChatQuery,
):

    try:

        units = (
            query.units
            or "metric"
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # Use the language selected by the frontend.
        # ----------------------------------------------------

        lang = (
            query.language
            or "en-IN"
        )


        # ----------------------------------------------------
        # Only auto-detect when no explicit language
        # was supplied.
        # ----------------------------------------------------

        if (
            not query.language
            and query.message
        ):

            detected = (
                detect_language_from_script(
                    query.message
                )
            )

            if detected:
                lang = detected


        # ----------------------------------------------------
        # WEATHER CONTEXT
        # ----------------------------------------------------

        context = await get_weather_context(
            latitude=query.latitude,
            longitude=query.longitude,
            days=query.days,
            message=query.message,
            location_name=query.location_name,
            units=units,
        )


        # ----------------------------------------------------
        # CHAT HISTORY
        # ----------------------------------------------------

        history_dicts = [
            h.model_dump()
            for h in query.history
        ] if query.history else []


        # ----------------------------------------------------
        # AI RESPONSE
        # ----------------------------------------------------

        response = await generate_weather_response(
            user_message=query.message,
            weather_context=context,
            history=history_dicts,
            language=lang,
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "message":
                query.message,

            "response":
                response,

            "weather_context":
                context,

            "units":
                units,

            "language":
                lang,
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "AI Assistant error: "
                f"{str(e)}"
            ),
        )