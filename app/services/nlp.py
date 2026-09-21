"""
Natural Language Parser & Multilingual Intent Extractor for WeatherGPT.
Extracts location names, temporal references (today, tomorrow, weekend, etc.),
comparison targets, and query intents across 11 languages:
English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada, Odia, Malayalam.
"""
import re
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from app.tools.geocode import geocode_place


# Multilingual Temporal Keywords mapping to day offset (0 = today, 1 = tomorrow, 2 = day after / weekend)
TEMPORAL_KEYWORDS: Dict[str, int] = {
    # English
    "today": 0, "tonight": 0, "now": 0, "current": 0,
    "tomorrow": 1, "day after tomorrow": 2, "this weekend": 2, "weekend": 2, "next week": 5,

    # Hindi (hi-IN)
    "आज": 0, "आज रात": 0, "अभी": 0,
    "कल": 1, "परसों": 2, "सप्ताहांत": 2, "वीकेंड": 2,

    # Bengali (bn-IN)
    "আজ": 0, "আজকে": 0, "এখন": 0,
    "আগামীকাল": 1, "কাল": 1, "পরশু": 2, "সপ্তাহান্তে": 2,

    # Marathi (mr-IN)
    "आज": 0, "आत्ता": 0,
    "उद्या": 1, "परवा": 2, "वीकेंड": 2,

    # Telugu (te-IN)
    "ఈ రోజు": 0, "ఈరోజు": 0, "నేడు": 0, "ఇప్పుడు": 0,
    "రేపు": 1, "రేపటి": 1, "ఎల్లుండి": 2, "వారాంతంలో": 2, "వీకెండ్": 2,

    # Tamil (ta-IN)
    "இன்று": 0, "இன்றைக்கு": 0, "இப்போது": 0,
    "நாளை": 1, "நாளைக்கு": 1, "நாளை மறுநாள்": 2, "வார இறுதி": 2,

    # Gujarati (gu-IN)
    "આજે": 0, "આજ": 0, "હમણાં": 0,
    "આવતીકાલે": 1, "કાલે": 1, "પરમ દિવસે": 2, "વીકેન્ડ": 2,

    # Urdu (ur-IN)
    "آج": 0, "آج رات": 0, "ابھی": 0,
    "کل": 1, "پرسوں": 2, "ہفتہ وار": 2,

    # Kannada (kn-IN)
    "ಇಂದು": 0, "ಈಗ": 0,
    "ನಾಳೆ": 1, "ನಾಡದ್ದು": 2, "ವಾರಾಂತ್ಯ": 2,

    # Odia (or-IN)
    "ଆଜି": 0, "ଏବେ": 0,
    "ଆସନ୍ତାକାଲି": 1, "କାଲି": 1, "ପରଦିନ": 2, "ସପ୍ତାହାନ୍ତ": 2,

    # Malayalam (ml-IN)
    "ഇന്ന്": 0, "ഇപ്പോൾ": 0,
    "നാളെ": 1, "മറ്റന്നാൾ": 2, "വാരാന്ത്യം": 2
}

DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

# Comparison Splitters across languages
COMPARISON_PATTERNS = [
    r"\bvs\b", r"\bversus\b", r"\bcompare\s+with\b", r"\bcompared\s+to\b", r"\band\b",
    r"\bबनाम\b", r"\bऔर\b", r"\bবনাম\b", r"\bএবং\b", r"\bविरुद्ध\b", r"\bआणि\b",
    r"\bవర్సెస్\b", r"\bమరియు\b", r"\bமற்றும்\b", r"\bઅને\b", r"\bبمقابلہ\b",
    r"\bاور\b", r"\bಮತ್ತು\b", r"\bଏବଂ\b", r"\bതമ്മിൽ\b", r"\bഒപ്പം\b"
]

# Indic Filler Words to clean from query string when extracting location candidates
INDIC_FILLER_WORDS = {
    # English
    "weather", "forecast", "temperature", "temp", "rain", "raining", "rainy",
    "will", "it", "is", "in", "at", "for", "how", "what", "hot", "cold", "today", "tomorrow",

    # Hindi / Urdu
    "क्या", "में", "mein", "बारिश", "होगी", "मौसम", "कैसा", "है", "तापमान", "कितना",
    "کیا", "میں", "بارش", "ہوگی", "موسم", "کیسا", "ہے", "درجہ", "حرارت",

    # Bengali
    "কি", "কী", "বৃষ্টি", "হবে", "আবহাওয়া", "কেমন", "তাপমাত্রা", "তে", "এ",

    # Marathi
    "का", "पाऊस", "पडेल", "हवामान", "कसे", "आहे", "तापमान", "मध्ये",

    # Telugu
    "వర్షం", "పడుతుందా", "వాతావరణం", "ఎలా", "ఉంది", "ఉష్ణోగ్రత", "లో", "లొ",

    # Tamil
    "மழை", "பெய்யுமா", "வானிலை", "எப்படி", "உள்ளது", "வெப்பநிலை", "இல்", "ல்",

    # Gujarati
    "શું", "વરસાદ", "પડશે", "હવામાન", "કેવું", "છે", "તાપમાન", "માં",

    # Kannada
    "ಮಳೆಯಾಗುತ್ತದೆಯೇ", "ಮಳೆ", "ಬರುತ್ತದೆಯೇ", "ಹವಾಮಾನ", "ಹೇಗಿದೆ", "ಹೇಗೆ", "ತಾಪಮಾನ", "ನಲ್ಲಿ", "ಲ್ಲಿ",

    # Odia
    "ବର୍ଷା", "ହେବ", "କି", "ପାଣିପାଗ", "କିପରି", "ଅଛି", "ତାପମାତ୍ରା", "ରେ",

    # Malayalam
    "മഴ", "പെയ്യുമോ", "കാലാവസ്ഥ", "എങ്ങനെ", "ആണ്", "താപനില", "ൽ", "യിൽ"
}

# Locative suffixes attached directly or with hyphen to city names in Indian languages
LOCATIVE_SUFFIX_REPLACEMENTS = [
    # Malayalam: ഹൈദരാബാദിൽ -> ഹൈദരാബാദ് (replace ിൽ with virama ്)
    (r"-?ത്തിൽ$", "ത്ത്"),
    (r"-?ദിൽ$", "ദ്"),
    (r"-?ിൽ$", "്"),
    (r"-?ൽ$", ""),

    # Tamil: ஹைதராபாத்தில் -> ஹைதராபாத்
    (r"-?த்தில்$", "த்"),
    (r"-?இல்$", ""),
    (r"-?ல்$", ""),
    (r"-?தில்$", ""),

    # Telugu: హైదరాబాద్లో -> హైదరాబాద్
    (r"-?లో$", ""),
    (r"-?లొ$", ""),

    # Marathi: हैदराबादमध्ये -> हैदराबाद, चेन्नईत -> चेन्नई
    (r"-?मध्ये$", ""),
    (r"-?त$", ""),

    # Bengali: হায়দ্রাবাদে -> হায়দ্রাবাদ, কলকাতায় -> কলকাতা
    (r"-?ে$", ""),
    (r"-?য়ে$", ""),
    (r"-?তে$", ""),

    # Kannada: ಹೈದರಾಬಾದ್ನಲ್ಲಿ -> ಹೈದರಾಬಾದ್
    (r"-?ನಲ್ಲಿ$", ""),
    (r"-?ಲ್ಲಿ$", ""),

    # Odia: ହାଇଦ୍ରାବାଦରେ -> ହାଇଦ୍ରାବାଦ
    (r"-?ରେ$", ""),

    # Gujarati: હૈદરાબાદમાં -> હૈદરાબાદ
    (r"-?માં$", ""),

    # Hindi / Urdu / Devanagari attached: हैदराबादमें -> हैदराबाद
    (r"-?में$", ""),
    (r"-?میں$", "")
]


def strip_locative_suffixes(word: str) -> str:
    w = word.strip()
    # Strip any trailing punctuation or hyphen
    w = re.sub(r"^[-–—\s]+|[-–—\s]+$", "", w)
    for pattern, repl in LOCATIVE_SUFFIX_REPLACEMENTS:
        if re.search(pattern, w):
            cleaned = re.sub(pattern, repl, w)
            if len(cleaned) >= 2:
                return re.sub(r"^[-–—\s]+|[-–—\s]+$", "", cleaned)
    return w


def parse_natural_query(text: str) -> Dict[str, Any]:
    """
    Parses a natural query string in any of the 11 supported languages
    to extract location, day offset, comparison intents, and question type.
    """
    cleaned = text.strip()
    cleaned_no_punct = re.sub(r"[?!.,;:।؟]", " ", cleaned).strip()
    lower = re.sub(r"\s+", " ", cleaned_no_punct).strip()

    # Check for Comparison intent across multilingual splitters
    for pattern in COMPARISON_PATTERNS:
        match = re.search(r"^(.*?)\s+" + pattern + r"\s+(.*?)$", lower, re.IGNORECASE)
        if match:
            loc1_raw = match.group(1).strip()
            loc2_raw = match.group(2).strip()

            words1 = [strip_locative_suffixes(w) for w in loc1_raw.split() if w.lower() not in INDIC_FILLER_WORDS]
            words2 = [strip_locative_suffixes(w) for w in loc2_raw.split() if w.lower() not in INDIC_FILLER_WORDS]

            loc1_cand = " ".join(words1).strip()
            loc2_cand = " ".join(words2).strip()

            if loc1_cand and loc2_cand:
                return {
                    "type": "comparison",
                    "location1": loc1_cand,
                    "location2": loc2_cand,
                    "raw_query": cleaned
                }

    # Extract temporal keywords across all 11 languages
    day_offset = 0
    temporal_match = "today"

    # Sort keywords by length descending so multi-word phrases match first
    sorted_keywords = sorted(TEMPORAL_KEYWORDS.keys(), key=len, reverse=True)
    for kw in sorted_keywords:
        pattern = r"(?:^|\s)" + re.escape(kw) + r"(?:$|\s)"
        if re.search(pattern, lower, flags=re.IGNORECASE):
            day_offset = TEMPORAL_KEYWORDS[kw]
            temporal_match = kw
            lower = re.sub(pattern, " ", lower, flags=re.IGNORECASE).strip()
            break

    # Check for English weekday names (e.g. "on Friday", "Saturday")
    today_weekday = datetime.now().weekday()
    for idx, day_name in enumerate(DAYS_OF_WEEK):
        if re.search(r"\b" + re.escape(day_name) + r"\b", lower, flags=re.IGNORECASE):
            temporal_match = day_name.capitalize()
            diff = (idx - today_weekday) % 7
            day_offset = diff if diff > 0 else 7
            lower = re.sub(r"\b" + re.escape(day_name) + r"\b", " ", lower, flags=re.IGNORECASE).strip()
            break

    # Tokenize and filter out filler words, then apply locative suffix stripping
    tokens = lower.split()
    cand_tokens = []
    for token in tokens:
        clean_tok = token.strip()
        if not clean_tok or clean_tok.lower() in INDIC_FILLER_WORDS:
            continue
        stripped = strip_locative_suffixes(clean_tok)
        if stripped and stripped.lower() not in INDIC_FILLER_WORDS:
            cand_tokens.append(stripped)

    location_candidate = " ".join(cand_tokens).strip()

    if not location_candidate:
        location_candidate = cleaned_no_punct

    return {
        "type": "weather_query",
        "location": location_candidate,
        "temporal": temporal_match,
        "day_offset": day_offset,
        "raw_query": cleaned
    }


async def resolve_location_and_weather(query_text: str, language: Optional[str] = "en-IN") -> Dict[str, Any]:
    """
    End-to-end NLP resolver: parses query, geocodes candidate location across languages,
    and returns resolved location metadata.
    """
    parsed = parse_natural_query(query_text)

    if parsed["type"] == "comparison":
        loc1_res = await geocode_place(parsed["location1"])
        loc2_res = await geocode_place(parsed["location2"])

        loc1_data = loc1_res.get("results", [])[0] if loc1_res.get("results") else None
        loc2_data = loc2_res.get("results", [])[0] if loc2_res.get("results") else None

        return {
            "mode": "comparison",
            "parsed": parsed,
            "loc1": loc1_data,
            "loc2": loc2_data,
            "success": bool(loc1_data and loc2_data)
        }

    # Standard query geocoding
    candidate_name = parsed["location"]
    geo_res = await geocode_place(candidate_name)
    results = geo_res.get("results", [])

    if not results:
        # Fallback: try individual words after locative stripping
        words = [strip_locative_suffixes(w) for w in candidate_name.split() if len(w) >= 2]
        for word in words:
            try:
                cand_geo = await geocode_place(word)
                if cand_geo.get("results"):
                    results = cand_geo["results"]
                    break
            except Exception:
                continue

    if not results:
        # Final fallback: full cleaned query
        try:
            fallback_geo = await geocode_place(query_text)
            results = fallback_geo.get("results", [])
        except Exception:
            results = []

    best_match = results[0] if results else None

    return {
        "mode": "weather",
        "parsed": parsed,
        "matched_locations": results,
        "best_match": best_match,
        "location": best_match,
        "success": bool(results)
    }
