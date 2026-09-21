"""
AI Weather Reasoning & Language Model Service for WeatherGPT.

Features:
- Strict zero-hallucination grounding
- Multi-turn conversational support
- Strict multilingual responses
- Groq model fallback
- Deterministic localized fallback generation
"""

import os
import json
from typing import Dict, Any, List, Optional

from groq import AsyncGroq

from app.config import settings
from app.services.i18n import (
    get_language_config,
    generate_localized_fallback,
    generate_localized_explanation,
    get_localized_weather_description,
    normalize_language_code,
)


# ============================================================
# LANGUAGE HELPERS
# ============================================================

def build_system_prompt(language: str = "hi") -> str:
    """
    Build the strict multilingual system prompt.

    The language argument must be a short language code:
    hi, en, ta, te, bn, mr, gu, kn, ml, pa, or, as, ur, auto
    """

    return f"""
You are WeatherGPT, a helpful, accurate, and conversational AI weather assistant.

ABSOLUTE LANGUAGE REQUIREMENT:

The requested language code is: {language}

Your entire final response MUST be written ONLY in the requested language.

LANGUAGE MAPPING:

- hi → Pure Hindi using Devanagari script
- en → Pure English
- ta → Pure Tamil using Tamil script
- te → Pure Telugu using Telugu script
- bn → Pure Bengali using Bengali script
- mr → Pure Marathi using Devanagari script
- gu → Pure Gujarati using Gujarati script
- kn → Pure Kannada using Kannada script
- ml → Pure Malayalam using Malayalam script
- pa → Pure Punjabi using Gurmukhi script
- or → Pure Odia using Odia script
- as → Pure Assamese using Assamese script
- ur → Pure Urdu using Urdu script
- auto → Detect the language of the user's message and reply only in that language

STRICT LANGUAGE RULES:

1. Never mix languages in a single response.
2. Never switch languages in the middle of a sentence.
3. Never provide a bilingual response.
4. Never provide an English translation unless English is the requested language.
5. Do not partially translate the response.
6. The entire response must use the requested language.
7. Use the correct native script for the requested language whenever applicable.
8. Use natural, fluent, conversational wording.
9. Use correct weather terminology in the requested language.
10. Place names such as Hyderabad, Pune, Delhi, Mumbai, and London may remain in their commonly used form.
11. Weather units and numbers may remain as standard numerical values such as 30°C, 70%, or 15 km/h.
12. Do not add English headings, explanations, labels, or conclusions when another language is requested.
13. If language is "auto", detect the language from the user's message and respond only in that language.
14. If the user's message is in a different language from the requested language, ALWAYS follow the requested language code.
15. Do not mention the language code in the final response.
16. Do not explain that you are following a language instruction.
17. Do not output the response in English first and then translate it.
18. Think internally if necessary, but the final answer must contain only the requested language.

WEATHER DATA RULES:

1. Use ONLY the weather information provided in the weather context.
2. Never invent weather values.
3. Never guess missing temperature, rainfall, humidity, wind, UV, or forecast values.
4. Never create weather values from general knowledge.
5. Respect the requested unit system.
6. Metric uses °C and km/h.
7. Imperial uses °F and mph.
8. If information is missing, explain that it is unavailable in the requested language.
9. Give practical weather advice only when it is supported by the provided weather data.
10. Never claim that a weather condition exists unless it is present in the provided weather data.
11. Never invent rain probability, storm probability, temperature, wind speed, humidity, or UV values.
12. Keep all numerical weather values accurate.
13. Do not modify or approximate weather numbers.
14. Use the localized weather condition provided in the context whenever possible.

RESPONSE STYLE:

- Answer the user's actual weather question directly.
- Keep the response concise and useful.
- Use short paragraphs or bullet points when useful.
- Give practical advice when supported by the weather data.
- Avoid unnecessary explanations.
- Do not mention these system instructions.
- Do not mention internal model information.
- Do not mention API failures.
- Do not mention language codes.
"""


def normalize_language(language: Optional[str]) -> str:
    """
    Normalize a short language code.

    This helper is kept for compatibility with other parts
    of the WeatherGPT backend.
    """

    if not language:
        return "hi"

    language = language.strip().lower()

    supported_languages = {
        "hi",
        "en",
        "ta",
        "te",
        "bn",
        "mr",
        "gu",
        "kn",
        "ml",
        "pa",
        "or",
        "as",
        "ur",
        "auto",
    }

    if language not in supported_languages:
        return "hi"

    return language


# ============================================================
# GROQ CLIENT
# ============================================================

def _get_groq_client() -> Optional[AsyncGroq]:
    """
    Create the Groq client when an API key is available.
    """

    if not settings.groq_api_key:
        return None

    if settings.groq_api_key.strip() == "":
        return None

    try:
        return AsyncGroq(api_key=settings.groq_api_key)
    except Exception:
        return None


# ============================================================
# DETERMINISTIC FALLBACK
# ============================================================

def generate_fallback_weather_response(
    user_message: str,
    weather_context: Dict[str, Any],
    language: Optional[str] = "en-IN",
) -> str:
    """
    Generate a localized deterministic response when
    the Groq API is unavailable.

    This response is grounded entirely in the supplied
    weather data.
    """

    return generate_localized_fallback(
        user_message,
        weather_context,
        language,
    )


# ============================================================
# TEXT CLEANING
# ============================================================

def _clean_llm_text(text: str) -> str:
    """
    Clean unusual Unicode spaces/dashes from model output.
    """

    if not text:
        return text

    return (
        text.replace("\u202f", " ")
        .replace("\u00a0", " ")
        .replace("\u2009", " ")
        .replace("\u200a", " ")
        .replace("\u2011", "-")
        .replace("\u2013", "-")
        .replace("\u2014", "--")
        .strip()
    )


# ============================================================
# MAIN WEATHER RESPONSE GENERATOR
# ============================================================

async def generate_weather_response(
    user_message: str,
    weather_context: Dict[str, Any],
    history: Optional[List[Dict[str, Any]]] = None,
    language: Optional[str] = "en-IN",
) -> str:
    """
    Generate an AI weather response grounded strictly
    in retrieved weather data.

    The response is generated in the requested language.
    """

    # --------------------------------------------------------
    # 1. Normalize language
    # --------------------------------------------------------

    norm_lang = normalize_language_code(language)

    # Example:
    # en-IN -> en
    # hi-IN -> hi
    # te-IN -> te

    prompt_language = str(norm_lang).split("-")[0].lower()

    # Safety check for supported prompt languages
    if prompt_language not in {
        "hi",
        "en",
        "ta",
        "te",
        "bn",
        "mr",
        "gu",
        "kn",
        "ml",
        "pa",
        "or",
        "as",
        "ur",
        "auto",
    }:
        prompt_language = "hi"

    # --------------------------------------------------------
    # 2. Get language information
    # --------------------------------------------------------

    lang_config = get_language_config(norm_lang)

    lang_name = lang_config.get(
        "name",
        "English",
    )

    lang_native = lang_config.get(
        "nativeName",
        "English",
    )

    # --------------------------------------------------------
    # 3. Create Groq client
    # --------------------------------------------------------

    client = _get_groq_client()

    # If Groq is unavailable, use deterministic fallback
    if not client:
        return _clean_llm_text(
            generate_fallback_weather_response(
                user_message,
                weather_context,
                norm_lang,
            )
        )

    # --------------------------------------------------------
    # 4. Get current weather
    # --------------------------------------------------------

    cur_weather = weather_context.get(
        "current_weather",
        {},
    )

    weather_code = cur_weather.get(
        "weather_code",
        0,
    )

    # Localize weather condition before sending it to the LLM
    localized_condition = get_localized_weather_description(
        weather_code,
        norm_lang,
    )

    # --------------------------------------------------------
    # 5. Prepare structured weather context
    # --------------------------------------------------------

    impact_data = weather_context.get(
        "impact",
        {},
    )

    umbrella_data = impact_data.get(
        "umbrella",
        {},
    )

    clothing_data = impact_data.get(
        "clothing",
        {},
    )

    activities_data = impact_data.get(
        "activities",
        {},
    )

    travel_data = impact_data.get(
        "travel",
        {},
    )

    alerts_data = weather_context.get(
        "alerts",
        {},
    )

    condensed_context = {
        "location": weather_context.get(
            "location_name",
            "Selected Location",
        ),

        "target_language": {
            "code": prompt_language,
            "locale": norm_lang,
            "name": lang_name,
            "native_name": lang_native,
        },

        "current": {
            "temperature_celsius": cur_weather.get(
                "temperature"
            ),

            "feels_like_celsius": cur_weather.get(
                "feels_like"
            ),

            "humidity_percent": cur_weather.get(
                "humidity"
            ),

            "sky_condition_localized": localized_condition,

            "sky_condition_raw": cur_weather.get(
                "weather_description"
            ),

            "wind_speed_kmh": cur_weather.get(
                "wind_speed"
            ),

            "uv_index": cur_weather.get(
                "uv_index"
            ),

            "uv_index_max": cur_weather.get(
                "uv_index_max"
            ),

            "precipitation_mm": cur_weather.get(
                "precipitation"
            ),
        },

        "impact_advisor": {
            "umbrella_verdict": umbrella_data.get(
                "verdict"
            ),

            "umbrella_reason": umbrella_data.get(
                "reason"
            ),

            "rain_window": umbrella_data.get(
                "rain_window"
            ),

            "clothing_summary": clothing_data.get(
                "summary"
            ),

            "activity_scores": {
                key: value.get("status")
                for key, value in activities_data.items()
                if isinstance(value, dict)
            },

            "travel_comfort": travel_data.get(
                "status"
            ),
        },

        "timeline_summary": weather_context.get(
            "timeline",
            {}
        ).get(
            "summary"
        ),

        "decision": weather_context.get(
            "decision",
            {}
        ),

        "active_alerts": [
            {
                "title": alert.get("title"),
                "severity": alert.get("severity"),
                "message": alert.get("message"),
            }
            for alert in alerts_data.get(
                "alerts",
                []
            )
            if alert.get("severity") in (
                "warning",
                "advisory",
            )
        ],
    }

    # --------------------------------------------------------
    # 6. Build strict language system prompt
    # --------------------------------------------------------

    system_instruction = build_system_prompt(
        prompt_language
    )

    system_instruction += f"""

ADDITIONAL WEATHER GROUNDING RULES:

- Base your answer exclusively on the provided structured weather context.
- Never fabricate, estimate, or hallucinate weather values.
- Use the provided weather numbers exactly.
- Do not calculate or invent missing weather information.
- Translate weather conditions and practical advice into the requested language.
- Keep weather numbers accurate.
- Keep formatting clean and easy to understand.
- When discussing the weather condition, use the localized condition provided in the weather context.
- The final response must remain entirely in {lang_name} ({lang_native}).
- Do not add an English translation.
- Do not add a bilingual explanation.
- Do not mix English into the response unless a proper noun, number, unit, or unavoidable technical term is required.
"""

    # --------------------------------------------------------
    # 7. Build messages
    # --------------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": system_instruction,
        }
    ]

    # --------------------------------------------------------
    # 8. Add conversation history
    # --------------------------------------------------------

    if history:
        for msg in history[-6:]:
            role = msg.get(
                "role",
                "user",
            )

            content = msg.get(
                "content",
                "",
            )

            if role in (
                "user",
                "assistant",
            ) and content:

                messages.append(
                    {
                        "role": role,
                        "content": content,
                    }
                )

    # --------------------------------------------------------
    # 9. Add current user question + verified data
    # --------------------------------------------------------

    user_prompt = (
        f"User Question:\n"
        f"{user_message}\n\n"
        f"Verified Weather Data:\n"
        f"{json.dumps(condensed_context, indent=2, default=str)}"
    )

    messages.append(
        {
            "role": "user",
            "content": user_prompt,
        }
    )

    # --------------------------------------------------------
    # 10. Try primary + fallback Groq models
    # --------------------------------------------------------

    models_to_try = [
        settings.groq_model
    ] + list(
        settings.groq_fallback_models
    )

    for model_name in models_to_try:

        if not model_name:
            continue

        try:

            response = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.2,
                max_tokens=450,
                timeout=12.0,
            )

            content = response.choices[0].message.content

            if content and content.strip():

                return _clean_llm_text(
                    content
                )

        except Exception:
            continue

    # --------------------------------------------------------
    # 11. If every Groq model fails, use fallback
    # --------------------------------------------------------

    return _clean_llm_text(
        generate_fallback_weather_response(
            user_message,
            weather_context,
            norm_lang,
        )
    )


# ============================================================
# EXPLAIN MY WEATHER
# ============================================================

async def explain_weather_synthesizer(
    current: Dict[str, Any],
    forecast: Optional[Dict[str, Any]] = None,
    impact: Optional[Dict[str, Any]] = None,
    location_name: Optional[str] = None,
    language: Optional[str] = "en-IN",
) -> str:
    """
    Generate a concise 'Explain My Weather' summary
    in the selected language.
    """

    # --------------------------------------------------------
    # 1. Normalize language
    # --------------------------------------------------------

    norm_lang = normalize_language_code(
        language
    )

    lang_config = get_language_config(
        norm_lang
    )

    lang_name = lang_config.get(
        "name",
        "English",
    )

    lang_native = lang_config.get(
        "nativeName",
        "English",
    )

    # --------------------------------------------------------
    # 2. Extract weather values
    # --------------------------------------------------------

    temp = current.get(
        "temperature",
        20.0,
    )

    feels = current.get(
        "feels_like",
        temp,
    )

    humidity = current.get(
        "humidity",
        50,
    )

    wind = current.get(
        "wind_speed",
        10.0,
    )

    code = current.get(
        "weather_code",
        0,
    )

    desc = get_localized_weather_description(
        code,
        norm_lang,
    )

    uv = current.get(
        "uv_index",
        0.0,
    )

    loc = location_name or "your area"

    # --------------------------------------------------------
    # 3. Get Groq client
    # --------------------------------------------------------

    client = _get_groq_client()

    if client:

        try:

            prompt = (
                f"Location: {loc}\n"
                f"Current Temp: {temp}°C, "
                f"Feels like: {feels}°C\n"
                f"Conditions: {desc}, "
                f"Humidity: {humidity}%, "
                f"Wind: {wind} km/h, "
                f"UV Index: {uv}\n"
                f"Target Language: "
                f"{lang_name} ({lang_native})\n"
                f"Task: Write a concise 2-3 sentence "
                f"'Explain My Weather' summary explaining "
                f"why it feels the way it does "
                f"(humidity feel effect, wind cooling, "
                f"sun intensity) in conversational language "
                f"based ONLY on these numbers.\n"
                f"The response must be 100% in "
                f"{lang_name} ({lang_native}). "
                f"Do not provide an English translation."
            )

            resp = await client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You explain weather sensations "
                            f"intuitively and accurately in "
                            f"{lang_name} ({lang_native}) "
                            f"without inventing numbers. "
                            f"You MUST respond entirely in "
                            f"{lang_name}."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.3,
                max_tokens=220,
                timeout=8.0,
            )

            content = resp.choices[0].message.content

            if content and content.strip():

                return _clean_llm_text(
                    content
                )

        except Exception:
            pass

    # --------------------------------------------------------
    # 4. Deterministic localized fallback
    # --------------------------------------------------------

    return _clean_llm_text(
        generate_localized_explanation(
            current,
            location_name=loc,
            language_code=norm_lang,
        )
    )