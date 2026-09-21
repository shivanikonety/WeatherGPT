"""
Centralized Multilingual Configuration & Localization Engine for WeatherGPT.
Supports 11 languages:
1. English (en-IN)
2. Hindi (hi-IN) — हिन्दी
3. Bengali (bn-IN) — বাংলা
4. Marathi (mr-IN) — मराठी
5. Telugu (te-IN) — తెలుగు
6. Tamil (ta-IN) — தமிழ்
7. Gujarati (gu-IN) — ગુજરાતી
8. Urdu (ur-IN) — اردو
9. Kannada (kn-IN) — ಕನ್ನಡ
10. Odia (or-IN) — ଓଡ଼ିଆ
11. Malayalam (ml-IN) — മലയാളം
"""
from typing import Dict, Any, Optional

LANGUAGES: Dict[str, Dict[str, Any]] = {
    "en-IN": {
        "code": "en-IN",
        "name": "English",
        "nativeName": "English",
        "native_name": "English",
        "speechRecognition": "en-IN",
        "speechSynthesis": "en-IN",
        "speech_locale": "en-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "hi-IN": {
        "code": "hi-IN",
        "name": "Hindi",
        "nativeName": "हिन्दी",
        "native_name": "हिन्दी",
        "speechRecognition": "hi-IN",
        "speechSynthesis": "hi-IN",
        "speech_locale": "hi-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "bn-IN": {
        "code": "bn-IN",
        "name": "Bengali",
        "nativeName": "বাংলা",
        "native_name": "বাংলা",
        "speechRecognition": "bn-IN",
        "speechSynthesis": "bn-IN",
        "speech_locale": "bn-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "mr-IN": {
        "code": "mr-IN",
        "name": "Marathi",
        "nativeName": "मराठी",
        "native_name": "मराठी",
        "speechRecognition": "mr-IN",
        "speechSynthesis": "mr-IN",
        "speech_locale": "mr-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "te-IN": {
        "code": "te-IN",
        "name": "Telugu",
        "nativeName": "తెలుగు",
        "native_name": "తెలుగు",
        "speechRecognition": "te-IN",
        "speechSynthesis": "te-IN",
        "speech_locale": "te-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "ta-IN": {
        "code": "ta-IN",
        "name": "Tamil",
        "nativeName": "தமிழ்",
        "native_name": "தமிழ்",
        "speechRecognition": "ta-IN",
        "speechSynthesis": "ta-IN",
        "speech_locale": "ta-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "gu-IN": {
        "code": "gu-IN",
        "name": "Gujarati",
        "nativeName": "ગુજરાતી",
        "native_name": "ગુજરાતી",
        "speechRecognition": "gu-IN",
        "speechSynthesis": "gu-IN",
        "speech_locale": "gu-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "ur-IN": {
        "code": "ur-IN",
        "name": "Urdu",
        "nativeName": "اردو",
        "native_name": "اردو",
        "speechRecognition": "ur-IN",
        "speechSynthesis": "ur-IN",
        "speech_locale": "ur-IN",
        "direction": "rtl",
        "fallback": "en-IN"
    },
    "kn-IN": {
        "code": "kn-IN",
        "name": "Kannada",
        "nativeName": "ಕನ್ನಡ",
        "native_name": "ಕನ್ನಡ",
        "speechRecognition": "kn-IN",
        "speechSynthesis": "kn-IN",
        "speech_locale": "kn-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "or-IN": {
        "code": "or-IN",
        "name": "Odia",
        "nativeName": "ଓଡ଼ିଆ",
        "native_name": "ଓଡ଼ିଆ",
        "speechRecognition": "or-IN",
        "speechSynthesis": "or-IN",
        "speech_locale": "or-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    },
    "ml-IN": {
        "code": "ml-IN",
        "name": "Malayalam",
        "nativeName": "മലയാളം",
        "native_name": "മലയാളം",
        "speechRecognition": "ml-IN",
        "speechSynthesis": "ml-IN",
        "speech_locale": "ml-IN",
        "direction": "ltr",
        "fallback": "en-IN"
    }
}

# Alias mappings (e.g., 'hi' -> 'hi-IN', 'te' -> 'te-IN')
LANGUAGE_ALIASES = {
    "en": "en-IN",
    "en-us": "en-IN",
    "en-gb": "en-IN",
    "hi": "hi-IN",
    "bn": "bn-IN",
    "mr": "mr-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "gu": "gu-IN",
    "ur": "ur-IN",
    "kn": "kn-IN",
    "or": "or-IN",
    "ml": "ml-IN"
}


def normalize_language_code(code: Optional[str]) -> str:
    """
    Normalizes any language string to one of the 11 supported canonical codes.
    Defaults to 'en-IN'.
    """
    if not code:
        return "en-IN"
    clean = code.strip().lower()
    if clean in LANGUAGES:
        return clean
    # Check case-insensitive match for keys
    for k in LANGUAGES:
        if k.lower() == clean:
            return k
    # Check aliases
    if clean in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[clean]
    # Check 2-letter prefix
    prefix = clean.split("-")[0].split("_")[0]
    if prefix in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[prefix]
    return "en-IN"


def is_supported_language(code: Optional[str]) -> bool:
    """Returns True if the language code is one of the 11 supported languages."""
    if not code:
        return False
    clean = code.strip().lower()
    return clean in LANGUAGES or any(k.lower() == clean for k in LANGUAGES) or clean in LANGUAGE_ALIASES or clean.split("-")[0].split("_")[0] in LANGUAGE_ALIASES


def detect_language_from_script(text: str) -> Optional[str]:
    """
    Detects Indian language from script characters if present.
    Returns canonical language code (e.g. 'te-IN', 'hi-IN', 'ta-IN') or None if English/Latin.
    """
    if not text:
        return None
    for ch in text:
        code_point = ord(ch)
        if 0x0C00 <= code_point <= 0x0C7F:
            return "te-IN"  # Telugu
        elif 0x0B80 <= code_point <= 0x0BFF:
            return "ta-IN"  # Tamil
        elif 0x0980 <= code_point <= 0x09FF:
            return "bn-IN"  # Bengali
        elif 0x0A80 <= code_point <= 0x0AFF:
            return "gu-IN"  # Gujarati
        elif 0x0C80 <= code_point <= 0x0CFF:
            return "kn-IN"  # Kannada
        elif 0x0B00 <= code_point <= 0x0B7F:
            return "or-IN"  # Odia
        elif 0x0D00 <= code_point <= 0x0D7F:
            return "ml-IN"  # Malayalam
        elif (0x0600 <= code_point <= 0x06FF) or (0x0750 <= code_point <= 0x077F) or (0xFB50 <= code_point <= 0xFDFF) or (0xFE70 <= code_point <= 0xFEFF):
            return "ur-IN"  # Urdu / Arabic
        elif 0x0900 <= code_point <= 0x097F:
            # Devanagari (Hindi / Marathi) - check Marathi specific words or default hi-IN
            if any(m_word in text for m_word in ["पाऊस", "हवामान", "कसे", "उद्या", "आहे", "जाणवणारे", "मध्ये"]):
                return "mr-IN"
            return "hi-IN"
    return None


def get_language_config(code: Optional[str]) -> Dict[str, Any]:
    norm = normalize_language_code(code)
    return LANGUAGES.get(norm, LANGUAGES["en-IN"])


# Localized WMO Weather Code Descriptions
LOCALIZED_WEATHER_DESCRIPTIONS: Dict[str, Dict[int, str]] = {
    "en-IN": {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
        55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight rain showers",
        81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
        96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    },
    "hi-IN": {
        0: "साफ आसमान", 1: "मुख्यतः साफ", 2: "आंशिक रूप से बादल", 3: "घने बादल",
        45: "कोहरा", 48: "सफेद पाला कोहरा", 51: "हल्की बूंदाबांदी", 53: "मध्यम बूंदाबांदी",
        55: "तेज बूंदाबांदी", 61: "हल्की बारिश", 63: "मध्यम बारिश", 65: "भारी बारिश",
        71: "हल्की बर्फबारी", 73: "मध्यम बर्फबारी", 75: "भारी बर्फबारी", 80: "हल्की बौछारें",
        81: "मध्यम बौछारें", 82: "तेज आंधी-बारिश", 95: "गरज के साथ तूफान",
        96: "ओलावृष्टि के साथ तूफान", 99: "भारी ओलावृष्टि के साथ तूफान"
    },
    "bn-IN": {
        0: "পরিষ্কার আকাশ", 1: "প্রধানত পরিষ্কার", 2: "আংশিক মেঘলা", 3: "মেঘলা",
        45: "কুয়াশাচ্ছন্ন", 48: "ঘন কুয়াশা", 51: "হালকা গুঁড়ি গুঁড়ি বৃষ্টি", 53: "মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি",
        55: "ঘন গুঁড়ি গুঁড়ি বৃষ্টি", 61: "হালকা বৃষ্টি", 63: "মাঝারি বৃষ্টি", 65: "ভারী বৃষ্টি",
        71: "হালকা তুষারপাত", 73: "মাঝারি তুষারপাত", 75: "ভারী তুষারপাত", 80: "হালকা বৃষ্টির ঝাপটা",
        81: "মাঝারি বৃষ্টির ঝাপটা", 82: "প্রবল বৃষ্টির ঝাপটা", 95: "বজ্রবিদ্যুৎ সহ ঝড়",
        96: "শিলাবৃষ্টি সহ ঝড়", 99: "ভারী শিলাবৃষ্টি সহ ঝড়"
    },
    "mr-IN": {
        0: "निरभ्र आकाश", 1: "मुख्यतः स्वच्छ", 2: "अंशतः ढगाळ", 3: "ढगाळ",
        45: "धुके", 48: "दाट धुके", 51: "हलकी रिमझिम", 53: "मध्यम रिमझिम",
        55: "जोरदार रिमझिम", 61: "हलका पाऊस", 63: "मध्यम पाऊस", 65: "मुसळधार पाऊस",
        71: "हलकी बर्फवृष्टी", 73: "मध्यम बर्फवृष्टी", 75: "जोरदार बर्फवृष्टी", 80: "हलक्या पावसाच्या सरी",
        81: "मध्यम पावसाच्या सरी", 82: "मुसळधार सरी", 95: "वादळी पाऊस / मेघगर्जना",
        96: "गारपिटीसह वादळ", 99: "मुसळधार गारपिटीसह वादळ"
    },
    "te-IN": {
        0: "నిర్మలమైన ఆకాశం", 1: "ఎక్కువగా నిర్మలంగా", 2: "పాక్షికంగా మేఘావృతం", 3: "పూర్తిగా మేఘావృతం",
        45: "పొగమంచు", 48: "దట్టమైన పొగమంచు", 51: "తేలికపాటి చిరుజల్లులు", 53: "మధ్యస్థ చిరుజల్లులు",
        55: "దట్టమైన చిరుజల్లులు", 61: "తేలికపాటి వర్షం", 63: "మధ్యస్థ వర్షం", 65: "భారీ వర్షం",
        71: "తేలికపాటి మంచు", 73: "మధ్యస్థ మంచు", 75: "భారీ మంచు", 80: "తేలికపాటి వర్షపు జల్లులు",
        81: "మధ్యస్థ వర్షపు జల్లులు", 82: "తీవ్రమైన వర్షపు జల్లులు", 95: "ఉరుములతో కూడిన వర్షం",
        96: "వడగళ్ళతో కూడిన ఉరుముల వర్షం", 99: "భారీ వడగళ్ళ వాన"
    },
    "ta-IN": {
        0: "தெளிவான வானம்", 1: "பெரும்பாலும் தெளிவானது", 2: "பகுதி மேகமூட்டம்", 3: "முழு மேகமூட்டம்",
        45: "பனிமூட்டம்", 48: "அடர்ந்த பனிமூட்டம்", 51: "லேசான தூறல்", 53: "மிதமான தூறல்",
        55: "அடர்ந்த தூறல்", 61: "லேசான மழை", 63: "மிதமான மழை", 65: "கனமழை",
        71: "லேசான பனிப்பொழிவு", 73: "மிதமான பனிப்பொழிவு", 75: "கடும் பனிப்பொழிவு", 80: "லேசான மழைச்சாரல்",
        81: "மிதமான மழைச்சாரல்", 82: "கடும் மழைச்சாரல்", 95: "இடி மின்னலுடன் கூடிய மழை",
        96: "ஆலங்கட்டி இடிமழை", 99: "கடும் ஆலங்கட்டி புயல்"
    },
    "gu-IN": {
        0: "સ્વચ્છ આકાશ", 1: "મુખ્યત્વે સ્વચ્છ", 2: "અંશતઃ વાદળછાયું", 3: "સંપૂર્ણ વાદળછાયું",
        45: "ધુમ્મસ", 48: "ગાઢ ધુમ્મસ", 51: "હળવી ઝરમર", 53: "મધ્યમ ઝરમર",
        55: "તીવ્ર ઝરમર", 61: "હળવો વરસાદ", 63: "મધ્યમ વરસાદ", 65: "ભારે વરસાદ",
        71: "હળવી હિમવર્ષા", 73: "મધ્યમ હિમવર્ષા", 75: "ભારે હિમવર્ષા", 80: "હળવા વરસાદી ઝાપટાં",
        81: "મધ્યમ વરસાદી ઝાપટાં", 82: "ભારે વરસાદી ઝાપટાં", 95: "ગાજવીજ સાથે વાવાઝોડું",
        96: "કરા સાથે વાવાઝોડું", 99: "ભારે કરા સાથે વાવાઝોડું"
    },
    "ur-IN": {
        0: "صاف آسمان", 1: "زیادہ تر صاف", 2: "جزوی طور پر ابر آلود", 3: "مکمل ابر آلود",
        45: "دھند", 48: "شدید دھند", 51: "ہلکی بونداباندی", 53: "معتدل بونداباندی",
        55: "تیز بونداباندی", 61: "ہلکی بارش", 63: "معتدل بارش", 65: "موسلادھار بارش",
        71: "ہلکی برف باری", 73: "معتدل برف باری", 75: "شدید برف باری", 80: "ہلکی پھلکی بوچھاڑ",
        81: "معتدل بوچھاڑ", 82: "شدید طوفانی بوچھاڑ", 95: "گرج چمک کے ساتھ طوفان",
        96: "ژالہ باری کے ساتھ طوفان", 99: "شدید ژالہ باری کے ساتھ طوفان"
    },
    "kn-IN": {
        0: "ಸ್ವಚ್ಛ ಆಕಾಶ", 1: "ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛ", 2: "ಭಾಗಶಃ ಮೋಡ", 3: "ಸಂಪೂರ್ಣ ಮೋಡ",
        45: "ದಟ್ಟ ಮಂಜು", 48: "ಹಿಮ ಮಂಜು", 51: "ತೆಳು ತುಂತುರು", 53: "ಮಧ್ಯಮ ತುಂತುರು",
        55: "ದಟ್ಟ ತುಂತುರು", 61: "ಲಘು ಮಳೆ", 63: "ಮಧ್ಯಮ ಮಳೆ", 65: "ಭಾರಿ ಮಳೆ",
        71: "ಲಘು ಹಿಮಪಾತ", 73: "ಮಧ್ಯಮ ಹಿಮಪಾತ", 75: "ಭಾರಿ ಹಿಮಪಾತ", 80: "ಲಘು ಮಳೆಯ ಸಿಂಚನ",
        81: "ಮಧ್ಯಮ ಮಳೆಯ ಸಿಂಚನ", 82: "ಭಾರಿ ಮಳೆಗಾಳಿ", 95: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
        96: "ಆಲಿಕಲ್ಲು ಸಹಿತ ಗುಡುಗು ಮಳೆ", 99: "ಭಾರಿ ಆಲಿಕಲ್ಲು ಮಳೆ"
    },
    "or-IN": {
        0: "ପରିଷ୍କାର ଆକାଶ", 1: "ମୁଖ୍ୟତଃ ପରିଷ୍କାର", 2: "ଆଂଶିକ ମେଘୁଆ", 3: "ସମ୍ପୂର୍ଣ୍ଣ ମେଘୁଆ",
        45: "କୁହୁଡ଼ି", 48: "ଘନ କୁହୁଡ଼ି", 51: "ହାଲୁକା ଝିପିଝିପି ବର୍ଷା", 53: "ମଧ୍ୟମ ଝିପିଝିପି ବର୍ଷା",
        55: "ଘନ ଝିପିଝିପି ବର୍ଷା", 61: "ହାଲୁକା ବର୍ଷା", 63: "ମଧ୍ୟମ ବର୍ଷା", 65: "ପ୍ରବଳ ବର୍ଷା",
        71: "ହାଲୁକା ତୁଷାରପାତ", 73: "ମଧ୍ୟମ ତୁଷାରପାତ", 75: "ପ୍ରବଳ ତୁଷାରପାତ", 80: "ହାଲୁକା ବର୍ଷା ଛିଟିକା",
        81: "ମଧ୍ୟମ ବର୍ଷା ଛିଟିକା", 82: "ପ୍ରବଳ ବର୍ଷା ଝଡ଼", 95: "ବଜ୍ରପାତ ସହ ଝଡ଼ବର୍ଷା",
        96: "କୁଆପଥର ସହ ଝଡ଼ବର୍ଷା", 99: "ପ୍ରବଳ କୁଆପଥର ବର୍ଷା"
    },
    "ml-IN": {
        0: "വ്യക്തമായ ആകാശം", 1: "പ്രധാനമായും തെളിഞ്ഞത്", 2: "ഭാഗികമായി മേഘാവൃതം", 3: "പൂർണ്ണമായും മേഘാവൃതം",
        45: "മൂടൽമഞ്ഞ്", 48: "കനത്ത മൂടൽമഞ്ഞ്", 51: "നേരിയ ചാറ്റൽമഴ", 53: "മിതമായ ചാറ്റൽമഴ",
        55: "ശക്തമായ ചാറ്റൽമഴ", 61: "നേരിയ മഴ", 63: "മിതമായ മഴ", 65: "കനത്ത മഴ",
        71: "നേരിയ മഞ്ഞുവീഴ്ച", 73: "മിതമായ മഞ്ഞുവീഴ്ച", 75: "കനത്ത മഞ്ഞുവീഴ്ച", 80: "നേരിയ മഴച്ചാറ്റൽ",
        81: "മിതമായ മഴച്ചാറ്റൽ", 82: "തീവ്രമായ മഴ", 95: "ഇടിമിന്നലോട് കൂടിയ മഴ",
        96: "ആലിപ്പഴത്തോട് കൂടിയ ഇടിമഴ", 99: "ശക്തമായ ആലിപ്പഴ വർഷം"
    }
}


def get_localized_weather_description(code: int, lang_code: Optional[str] = "en-IN") -> str:
    norm = normalize_language_code(lang_code)
    lang_dict = LOCALIZED_WEATHER_DESCRIPTIONS.get(norm, LOCALIZED_WEATHER_DESCRIPTIONS["en-IN"])
    if code in lang_dict:
        return lang_dict[code]
    return LOCALIZED_WEATHER_DESCRIPTIONS["en-IN"].get(code, "Variable conditions")


# Fallback Templates & Vocabulary across 11 languages
FALLBACK_VOCABULARY: Dict[str, Dict[str, str]] = {
    "en-IN": {
        "precip_outlook": "🌧️ **Precipitation Outlook**",
        "rain_prob_6h": "• **Rain Probability (Next 6h)**",
        "umbrella_rec": "• **Umbrella Recommendation**",
        "expected_window": "• **Expected Window**",
        "activity_assess": "🏃 **Activity Assessment**",
        "reason": "• **Reason**",
        "cycling_suit": "• **Cycling Suitability**",
        "running_suit": "• **Running Suitability**",
        "walking_suit": "• **Outdoor Walking**",
        "clothing_sugg": "👕 **Clothing Suggestion**",
        "layering": "• **Layering**",
        "suggested_items": "• **Suggested Items**",
        "accessories": "• **Accessories**",
        "temp_comfort": "🌡️ **Temperature & Comfort**",
        "why_feels_diff": "• **Why it feels different**",
        "thermal_sensation": "• **Thermal Sensation**",
        "weather_overview": "🌤️ **Current Weather Overview**",
        "insight": "• **Insight**",
        "timeline": "• **Timeline**",
        "active_alert": "⚠️ **Active Weather Alert**",
        "data_source": "*Data source: Open-Meteo verified metrics.*",
        "currently": "Currently",
        "feels_like": "feels like",
        "humidity": "humidity",
        "wind": "wind",
        "mostly_dry": "Conditions are mostly dry.",
        "rain_likely": "Rain is likely in the upcoming hours.",
        "not_needed": "Not needed",
        "carry_umbrella": "Carry an umbrella",
        "comfortable": "Comfortable conditions"
    },
    "hi-IN": {
        "precip_outlook": "🌧️ **बारिश का पूर्वानुमान**",
        "rain_prob_6h": "• **बारिश की संभावना (अगले 6 घंटे)**",
        "umbrella_rec": "• **छाते की सिफारिश**",
        "expected_window": "• **अनुमानित समय**",
        "activity_assess": "🏃 **बाहरी गतिविधियों का आकलन**",
        "reason": "• **कारण**",
        "cycling_suit": "• **साइकिल चलाने की उपयुक्तता**",
        "running_suit": "• **दौड़ने की उपयुक्तता**",
        "walking_suit": "• **पैदल चलने की उपयुक्तता**",
        "clothing_sugg": "👕 **कपड़ों का सुझाव**",
        "layering": "• **कपड़ों की परतें**",
        "suggested_items": "• **सुझाए गए वस्त्र**",
        "accessories": "• **सहायक सामग्री**",
        "temp_comfort": "🌡️ **तापमान और आराम**",
        "why_feels_diff": "• **यह अलग क्यों महसूस होता है**",
        "thermal_sensation": "• **तापमान का अहसास**",
        "weather_overview": "🌤️ **वर्तमान मौसम अवलोकन**",
        "insight": "• **मौसम सलाह**",
        "timeline": "• **समयरेखा**",
        "active_alert": "⚠️ **सक्रिय मौसम चेतावनी**",
        "data_source": "*डेटा स्रोत: ओपन-मेटियो सत्यापित मेट्रिक्स।*",
        "currently": "वर्तमान में",
        "feels_like": "महसूस होता है",
        "humidity": "आर्द्रता",
        "wind": "हवा की गति",
        "mostly_dry": "मौसम मुख्य रूप से शुष्क रहने की संभावना है।",
        "rain_likely": "आने वाले घंटों में बारिश की संभावना है।",
        "not_needed": "आवश्यकता नहीं है",
        "carry_umbrella": "छाता साथ रखें",
        "comfortable": "आरामदायक मौसम"
    },
    "bn-IN": {
        "precip_outlook": "🌧️ **বৃষ্টির পূর্বাভাস**",
        "rain_prob_6h": "• **বৃষ্টির সম্ভাবনা (পরবর্তী ৬ ঘণ্টা)**",
        "umbrella_rec": "• **ছাতার পরামর্শ**",
        "expected_window": "• **সম্ভাব্য সময়কাল**",
        "activity_assess": "🏃 **বাইরের কার্যকলাপ মূল্যায়ন**",
        "reason": "• **কারণ**",
        "cycling_suit": "• **সাইক্লিংয়ের উপযুক্ততা**",
        "running_suit": "• **দৌড়ানোর উপযুক্ততা**",
        "walking_suit": "• **হাঁটার উপযুক্ততা**",
        "clothing_sugg": "👕 **পোশাকের পরামর্শ**",
        "layering": "• **পোশাকের স্তর**",
        "suggested_items": "• **প্রস্তাবিত পোশাক**",
        "accessories": "• **আনুষাঙ্গিক জিনিস**",
        "temp_comfort": "🌡️ **তাপমাত্রা ও স্বাচ্ছন্দ্য**",
        "why_feels_diff": "• **কেন ভিন্ন অনুভূত হয়**",
        "thermal_sensation": "• **তাপীয় অনুভূতি**",
        "weather_overview": "🌤️ **বর্তমান আবহাওয়ার সারসংক্ষেপ**",
        "insight": "• **আবহাওয়া অন্তর্দৃষ্টি**",
        "timeline": "• **সময়রেখা**",
        "active_alert": "⚠️ **সক্রিয় আবহাওয়া সতর্কতা**",
        "data_source": "*তথ্য সূত্র: ওপেন-মেটিও যাচাইকৃত ডেটা।*",
        "currently": "বর্তমানে",
        "feels_like": "অনুভূত হচ্ছে",
        "humidity": "আর্দ্রতা",
        "wind": "বাতাসের গতি",
        "mostly_dry": "আবহাওয়া প্রধানত শুষ্ক থাকবে।",
        "rain_likely": "আসন্ন কয়েক ঘণ্টায় বৃষ্টির সম্ভাবনা রয়েছে।",
        "not_needed": "প্রয়োজন নেই",
        "carry_umbrella": "একটি ছাতা সাথে রাখুন",
        "comfortable": "স্বস্তিদায়ক অবস্থা"
    },
    "mr-IN": {
        "precip_outlook": "🌧️ **पावसाचा अंदाज**",
        "rain_prob_6h": "• **पावसाची शक्यता (पुढील ६ तास)**",
        "umbrella_rec": "• **छत्रीची शिफारस**",
        "expected_window": "• **अपेक्षित वेळ**",
        "activity_assess": "🏃 **बाहेरील उपक्रमांचे मूल्यांकन**",
        "reason": "• **कारण**",
        "cycling_suit": "• **सायकलिंगची अनुकूलता**",
        "running_suit": "• **रनिंगची अनुकूलता**",
        "walking_suit": "• **चालण्याची अनुकूलता**",
        "clothing_sugg": "👕 **कपड्यांचा सल्ला**",
        "layering": "• **कपड्यांचे थर**",
        "suggested_items": "• **सुचवलेले कपडे**",
        "accessories": "• **इतर साहित्य**",
        "temp_comfort": "🌡️ **तापमान आणि आराम**",
        "why_feels_diff": "• **फरक का जाणवतो**",
        "thermal_sensation": "• **तापमानाची जाणीव**",
        "weather_overview": "🌤️ **सद्य हवामान आढावा**",
        "insight": "• **हवामान सल्ला**",
        "timeline": "• **वेळापत्रक**",
        "active_alert": "⚠️ **सक्रिय हवामान इशारा**",
        "data_source": "*माहिती स्रोत: ओपन-मेटिओ पडताळणी केलेली आकडेवारी.*",
        "currently": "सध्या",
        "feels_like": "जाणवणारे तापमान",
        "humidity": "आर्द्रता",
        "wind": "वाऱ्याचा वेग",
        "mostly_dry": "हवामान मुख्यत्वे कोरडे राहील.",
        "rain_likely": "पुढील काही तासांत पाऊस पडण्याची शक्यता आहे.",
        "not_needed": "गरज नाही",
        "carry_umbrella": "छत्री सोबत ठेवा",
        "comfortable": "सुखद वातावरण"
    },
    "te-IN": {
        "precip_outlook": "🌧️ **వర్ష సూచన & అంచనా**",
        "rain_prob_6h": "• **వర్షం పడే అవకాశం (తదుపరి 6 గంటలు)**",
        "umbrella_rec": "• **గొడుగు సిఫార్సు**",
        "expected_window": "• **అంచనా వేసిన సమయం**",
        "activity_assess": "🏃 **బయటి కార్యకలాపాల అంచనా**",
        "reason": "• **కారణం**",
        "cycling_suit": "• **సైక్లింగ్ అనుకూలత**",
        "running_suit": "• **రన్నింగ్ అనుకూలత**",
        "walking_suit": "• **వాకింగ్ అనుకూలత**",
        "clothing_sugg": "👕 **దుస్తుల సలహా**",
        "layering": "• **దుస్తుల పొరలు**",
        "suggested_items": "• **సిఫార్సు చేసిన దుస్తులు**",
        "accessories": "• **అదనపు వస్తువులు**",
        "temp_comfort": "🌡️ **ఉష్ణోగ్రత & సౌకర్యం**",
        "why_feels_diff": "• **ఎందుకు తేడాగా అనిపిస్తుంది**",
        "thermal_sensation": "• **ఉష్ణోగ్రత అనుభూతి**",
        "weather_overview": "🌤️ **ప్రస్తుత వాతావరణ సమాచారం**",
        "insight": "• **వాతావరణ విశ్లేషణ**",
        "timeline": "• **సమయరేఖ**",
        "active_alert": "⚠️ **వాతావరణ హెచ్చరిక**",
        "data_source": "*డేటా మూలం: ఓపెన్-మెటియో ధృవీకరించిన కొలతలు.*",
        "currently": "ప్రస్తుతం",
        "feels_like": "అనిపించే ఉష్ణోగ్రత",
        "humidity": "తేమ",
        "wind": "గాలి వేగం",
        "mostly_dry": "వాతావరణం చాలా వరకు పొడిగా ఉంటుంది.",
        "rain_likely": "రాబోయే గంటల్లో వర్షం పడే అవకాశం ఉంది.",
        "not_needed": "అవసరం లేదు",
        "carry_umbrella": "గొడుగు వెంట ఉంచుకోండి",
        "comfortable": "అనుకూలమైన వాతావరణం"
    },
    "ta-IN": {
        "precip_outlook": "🌧️ **மழை கண்ணோட்டம் & முன்னறிவிப்பு**",
        "rain_prob_6h": "• **மழைக்கான வாய்ப்பு (அடுத்த 6 மணிநேரம்)**",
        "umbrella_rec": "• **குடை பரிந்துரை**",
        "expected_window": "• **எதிர்பார்க்கப்படும் நேரம்**",
        "activity_assess": "🏃 **வெளிப்புற நடவடிக்கைகள் மதிப்பீடு**",
        "reason": "• **காரணம்**",
        "cycling_suit": "• **சைக்கிள் ஓட்டுதல் பொருத்தம்**",
        "running_suit": "• **ஓட்டப் பயிற்சி பொருத்தம்**",
        "walking_suit": "• **நடைபயிற்சி பொருத்தம்**",
        "clothing_sugg": "👕 **ஆடை பரிந்துரை**",
        "layering": "• **ஆடை அடுக்குகள்**",
        "suggested_items": "• **பரிந்துரைக்கப்பட்ட ஆடைகள்**",
        "accessories": "• **துணைப் பொருட்கள்**",
        "temp_comfort": "🌡️ **வெப்பநிலை & சௌகரியம்**",
        "why_feels_diff": "• **வெப்பநிலை மாறுபட்டு உணரப்படுவதற்கான காரணம்**",
        "thermal_sensation": "• **வெப்ப உணர்வு**",
        "weather_overview": "🌤️ **தற்போதைய வானிலை கண்ணோட்டம்**",
        "insight": "• **வானிலை நுண்ணறிவு**",
        "timeline": "• **காலவரிசை**",
        "active_alert": "⚠️ **செயலில் உள்ள வானிலை எச்சரிக்கை**",
        "data_source": "*தரவு ஆதாரம்: ஓபன்-மெட்டியோ சரிபார்க்கப்பட்ட அளவீடுகள்.*",
        "currently": "தற்போது",
        "feels_like": "உணரப்படும் வெப்பநிலை",
        "humidity": "ஈரப்பதம்",
        "wind": "காற்றின் வேகம்",
        "mostly_dry": "வானிலை பெரும்பாலும் வறண்டதாக இருக்கும்.",
        "rain_likely": "அடுத்த சில மணிநேரங்களில் மழை பெய்ய வாய்ப்புள்ளது.",
        "not_needed": "தேவையில்லை",
        "carry_umbrella": "குடை எடுத்துச் செல்லுங்கள்",
        "comfortable": "சௌகரியமான வானிலை"
    },
    "gu-IN": {
        "precip_outlook": "🌧️ **વરસાદનો અંદાજ**",
        "rain_prob_6h": "• **વરસાદની સંભાવના (આગામી 6 કલાક)**",
        "umbrella_rec": "• **છત્રીની ભલામણ**",
        "expected_window": "• **અપેક્ષિત સમયગાળો**",
        "activity_assess": "🏃 **બહારની પ્રવૃત્તિઓનું મૂલ્યાંકન**",
        "reason": "• **કારણ**",
        "cycling_suit": "• **સાયકલિંગની અનુકૂળતા**",
        "running_suit": "• **દોડવાની અનુકૂળતા**",
        "walking_suit": "• **ચાલવાની અનુકૂળતા**",
        "clothing_sugg": "👕 **કપડાં માટેનું સૂચન**",
        "layering": "• **કપડાંના સ્તરો**",
        "suggested_items": "• **સૂચવેલા વસ્ત્રો**",
        "accessories": "• **વધારાની વસ્તુઓ**",
        "temp_comfort": "🌡️ **તાપમાન અને આરામ**",
        "why_feels_diff": "• **શા માટે અલગ અનુભવાય છે**",
        "thermal_sensation": "• **તાપમાનની અનુભૂતિ**",
        "weather_overview": "🌤️ **વર્તમાન હવામાન વિહંગાવલોકન**",
        "insight": "• **હવામાન વિશ્લેષણ**",
        "timeline": "• **સમયરેખા**",
        "active_alert": "⚠️ **સક્રિય હવામાન ચેતવણી**",
        "data_source": "*ડેટા સ્ત્રોત: ઓપન-મેટિઓ ચકાસાયેલ મેટ્રિક્સ.*",
        "currently": "હાલમાં",
        "feels_like": "અનુભવાતું તાપમાન",
        "humidity": "ભેજ",
        "wind": "પવનની ગતિ",
        "mostly_dry": "હવામાન મુખ્યત્વે શુષ્ક રહેશે.",
        "rain_likely": "આગામી કલાકોમાં વરસાદ પડવાની સંભાવના છે.",
        "not_needed": "જરૂર નથી",
        "carry_umbrella": "છત્રી સાથે રાખો",
        "comfortable": "સુખદ વાતાવરણ"
    },
    "ur-IN": {
        "precip_outlook": "🌧️ **بارش کا امکان اور پیش گوئی**",
        "rain_prob_6h": "• **بارش کا امکان (اگلے 6 گھنٹے)**",
        "umbrella_rec": "• **چھتری کی ضرورت**",
        "expected_window": "• **متوقع وقت**",
        "activity_assess": "🏃 **بیرونی سرگرمیوں کا جائزہ**",
        "reason": "• **وجہ**",
        "cycling_suit": "• **سائیکلنگ کی موزونیت**",
        "running_suit": "• **دوڑنے کی موزونیت**",
        "walking_suit": "• **چہل قدمی کی موزونیت**",
        "clothing_sugg": "👕 **لباس کی تجویز**",
        "layering": "• **لباس کی تہیں**",
        "suggested_items": "• **تجویز کردہ ملبوسات**",
        "accessories": "• **دیگر اشیاء**",
        "temp_comfort": "🌡️ **درجہ حرارت اور احساس**",
        "why_feels_diff": "• **یہ مختلف کیوں محسوس ہوتا ہے**",
        "thermal_sensation": "• **حرارتی احساس**",
        "weather_overview": "🌤️ **موجودہ موسم کا جائزہ**",
        "insight": "• **موسمی بصیرت**",
        "timeline": "• **ٹائم لائن**",
        "active_alert": "⚠️ **موسم کا الرٹ**",
        "data_source": "*ڈیٹا کا ماخذ: اوپن میٹیو تصدیق شدہ معلومات۔*",
        "currently": "اس وقت",
        "feels_like": "محسوس درجہ حرارت",
        "humidity": "نمی",
        "wind": "ہوا کی رفتار",
        "mostly_dry": "موسم زیادہ تر خشک رہنے کا امکان ہے۔",
        "rain_likely": "آنے والے گھنٹوں میں بارش کا امکان ہے۔",
        "not_needed": "ضرورت نہیں ہے",
        "carry_umbrella": "چھتری ساتھ رکھیں",
        "comfortable": "خوشگوار موسم"
    },
    "kn-IN": {
        "precip_outlook": "🌧️ **ಮಳೆಯ ಮುನ್ಸೂಚನೆ**",
        "rain_prob_6h": "• **ಮಳೆಯ ಸಾಧ್ಯತೆ (ಮುಂದಿನ 6 ಗಂಟೆಗಳು)**",
        "umbrella_rec": "• **ಛತ್ರಿಯ ಶಿಫಾರಸು**",
        "expected_window": "• **ನಿರೀಕ್ಷಿತ ಸಮಯ**",
        "activity_assess": "🏃 **ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳ ಮೌಲ್ಯಮಾಪನ**",
        "reason": "• **ಕಾರಣ**",
        "cycling_suit": "• **ಸೈಕ್ಲಿಂಗ್ ಸೂಕ್ತತೆ**",
        "running_suit": "• **ರನ್ನಿಂಗ್ ಸೂಕ್ತತೆ**",
        "walking_suit": "• **ನಡಿಗೆಯ ಸೂಕ್ತತೆ**",
        "clothing_sugg": "👕 **ಉಡುಪುಗಳ ಸಲಹೆ**",
        "layering": "• **ಉಡುಪಿನ ಪದರಗಳು**",
        "suggested_items": "• **ಶಿಫಾರಸು ಮಾಡಿದ ಬಟ್ಟೆಗಳು**",
        "accessories": "• **ಪೂರಕ ವಸ್ತುಗಳು**",
        "temp_comfort": "🌡️ **ತಾಪಮಾನ ಮತ್ತು ಆರಾಮ**",
        "why_feels_diff": "• **ವ್ಯತ್ಯಾಸ ಏಕೆ ಅನಿಸುತ್ತದೆ**",
        "thermal_sensation": "• **ಶಾಖದ ಅನುಭವ**",
        "weather_overview": "🌤️ **ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಅವಲೋಕನ**",
        "insight": "• **ಹವಾಮಾನ ಒಳನೋಟ**",
        "timeline": "• **ಸಮಯರೇಖೆ**",
        "active_alert": "⚠️ **ಸಕ್ರಿಯ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ**",
        "data_source": "*ಡೇಟಾ ಮೂಲ: ಓಪನ್-ಮೆಟಿಯೊ ಪರಿಶೀಲಿಸಿದ ಮೆಟ್ರಿಕ್ಸ್.*",
        "currently": "ಪ್ರಸ್ತುತ",
        "feels_like": "ಅನಿಸುವ ತಾಪಮಾನ",
        "humidity": "ಆರ್ದ್ರತೆ",
        "wind": "ಗಾಳಿಯ ವೇಗ",
        "mostly_dry": "ಹವಾಮಾನವು ಹೆಚ್ಚಾಗಿ ಒಣಗಿರುತ್ತದೆ.",
        "rain_likely": "ಮುಂದಿನ ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ.",
        "not_needed": "ಅಗತ್ಯವಿಲ್ಲ",
        "carry_umbrella": "ಛತ್ರಿ ಜೊತೆಯಲ್ಲಿಡಿ",
        "comfortable": "ಆಹ್ಲಾದಕರ ವಾತಾವರಣ"
    },
    "or-IN": {
        "precip_outlook": "🌧️ **ବର୍ଷା ପୂର୍ବାନୁମାନ**",
        "rain_prob_6h": "• **ବର୍ଷା ସମ୍ଭାବନା (ପରବର୍ତ୍ତୀ ୬ ଘଣ୍ଟା)**",
        "umbrella_rec": "• **ଛତା ବ୍ୟବହାର ସୁପାରିଶ**",
        "expected_window": "• **ସମ୍ଭାବ୍ୟ ସମୟ**",
        "activity_assess": "🏃 **ବାହ୍ୟ କାର୍ଯ୍ୟକଳାପ ଆକଳନ**",
        "reason": "• **କାରଣ**",
        "cycling_suit": "• **ସାଇକେଲ ଚାଳନା ଅନୁକୂଳତା**",
        "running_suit": "• **ଦୌଡ଼ିବା ଅନୁକୂଳତା**",
        "walking_suit": "• **ଚାଲିବା ଅନୁକୂଳତା**",
        "clothing_sugg": "👕 **ପୋଷାକ ପରାମର୍ଶ**",
        "layering": "• **ପୋଷାକର ସ୍ତର**",
        "suggested_items": "• **ପ୍ରସ୍ତାବିତ ପୋଷାକ**",
        "accessories": "• **ଆନୁଷଙ୍ଗିକ ସାମଗ୍ରୀ**",
        "temp_comfort": "🌡️ **ତାପମାତ୍ରା ଓ ଆରାମ**",
        "why_feels_diff": "• **ଏହା ଭିନ୍ନ କାହିଁକି ଲାଗେ**",
        "thermal_sensation": "• **ତାପୀୟ ଅନୁଭୂତି**",
        "weather_overview": "🌤️ **ସାମ୍ପ୍ରତିକ ପାଣିପାଗ ସମୀକ୍ଷା**",
        "insight": "• **ପାଣିପାଗ ପରାମର୍ଶ**",
        "timeline": "• **ସମୟସୀମା**",
        "active_alert": "⚠️ **ସକ୍ରିୟ ପାଣିପାଗ ସତର୍କତା**",
        "data_source": "*ତଥ୍ୟ ଉତ୍ସ: ଓପନ-ମେଟିଓ ଯାଞ୍ଚ ହୋଇଥିବା ମେଟ୍ରିକ୍ସ।*",
        "currently": "ବର୍ତ୍ତମାନ",
        "feels_like": "ଅନୁଭୂତ ତାପମାତ୍ରା",
        "humidity": "ଆର୍ଦ୍ରତା",
        "wind": "ପବନର ବେଗ",
        "mostly_dry": "ପାଣିପାଗ ମୁଖ୍ୟତଃ ଶୁଖିଲା ରହିବ।",
        "rain_likely": "ଆଗାମୀ କିଛି ଘଣ୍ଟା ମଧ୍ୟରେ ବର୍ଷା ହେବାର ସମ୍ଭାବନା ଅଛି।",
        "not_needed": "ଆବଶ୍ୟକ ନାହିଁ",
        "carry_umbrella": "ଛତା ସାଙ୍ଗରେ ରଖନ୍ତୁ",
        "comfortable": "ଆରାମଦାୟକ ପାଣିପାଗ"
    },
    "ml-IN": {
        "precip_outlook": "🌧️ **മഴ സാധ്യതയും പ്രവചനവും**",
        "rain_prob_6h": "• **മഴ സാധ്യത (അടുത്ത 6 മണിക്കൂർ)**",
        "umbrella_rec": "• **കുട ശുപാർശ**",
        "expected_window": "• **പ്രതീക്ഷിക്കുന്ന സമയം**",
        "activity_assess": "🏃 **പുറത്തെ പ്രവർത്തനങ്ങളുടെ വിലയിരുത്തൽ**",
        "reason": "• **കാരണം**",
        "cycling_suit": "• **സൈക്ലിംഗ് അനുയോജ്യത**",
        "running_suit": "• **ഓട്ട പരിശീലന അനുയോജ്യത**",
        "walking_suit": "• **നടത്ത അനുയോജ്യത**",
        "clothing_sugg": "👕 **വസ്ത്രധാരണ നിർദ്ദേശം**",
        "layering": "• **വസ്ത്ര ലെയറുകൾ**",
        "suggested_items": "• **ശുപാർശ ചെയ്യുന്ന വസ്ത്രങ്ങൾ**",
        "accessories": "• **അനുബന്ധ സാധനങ്ങൾ**",
        "temp_comfort": "🌡️ **താപനിലയും സുഖവും**",
        "why_feels_diff": "• **വ്യത്യസ്തമായി അനുഭവപ്പെടാൻ കാരണം**",
        "thermal_sensation": "• **താപ അനുഭവം**",
        "weather_overview": "🌤️ **നിലവിലെ കാലാവസ്ഥ അവലോകനം**",
        "insight": "• **കാലാവസ്ഥാ വിശകലനം**",
        "timeline": "• **സമയക്രമം**",
        "active_alert": "⚠️ **കാലാവസ്ഥാ മുന്നറിയിപ്പ്**",
        "data_source": "*ഡാറ്റാ ഉറവിടം: ഓപ്പൺ-മെറ്റിയോ പരിശോധിച്ച കണക്കുകൾ.*",
        "currently": "നിലവിൽ",
        "feels_like": "അനുഭവപ്പെടുന്ന താപനില",
        "humidity": "ഈർപ്പം",
        "wind": "കാറ്റിന്റെ വേഗത",
        "mostly_dry": "കാലാവസ്ഥ പ്രധാനമായും വരണ്ടതായിരിക്കും.",
        "rain_likely": "അടുത്ത മണിക്കൂറുകളിൽ മഴയ്ക്ക് സാധ്യതയുണ്ട്.",
        "not_needed": "ആവശ്യമില്ല",
        "carry_umbrella": "കുട കരുതുക",
        "comfortable": "സുഖകരമായ കാലാവസ്ഥ"
    }
}

# Attach wmo and fallback_templates references into LANGUAGES dictionary
for _lang_code, _lang_dict in LANGUAGES.items():
    _lang_dict["wmo"] = LOCALIZED_WEATHER_DESCRIPTIONS.get(_lang_code, LOCALIZED_WEATHER_DESCRIPTIONS["en-IN"])
    _lang_dict["fallback_templates"] = FALLBACK_VOCABULARY.get(_lang_code, FALLBACK_VOCABULARY["en-IN"])


def generate_localized_fallback(
    user_message: str,
    weather_context: Dict[str, Any],
    language_code: Optional[str] = None,
    language: Optional[str] = None
) -> str:
    """
    Generates a high-quality deterministic fallback response in the selected language.
    Guarantees 100% uptime and zero hallucinations without language mixing.
    """
    lang = language or language_code or "en-IN"
    norm = normalize_language_code(lang)
    vocab = FALLBACK_VOCABULARY.get(norm, FALLBACK_VOCABULARY["en-IN"])

    current = weather_context.get("current_weather", {})
    decision_info = weather_context.get("decision", {})
    impact_info = weather_context.get("impact", {})
    alerts_info = weather_context.get("alerts", {})
    timeline_info = weather_context.get("timeline", {})

    temp = current.get("temperature", "--")
    feels = current.get("feels_like", temp)
    code = current.get("weather_code", 0)
    cond = get_localized_weather_description(code, norm)
    humidity = current.get("humidity", "--")
    wind = current.get("wind_speed", "--")
    rain_prob = decision_info.get("rain_probability_next_hours", 0)

    umbrella = impact_info.get("umbrella", {})
    umbrella_needed = umbrella.get("needed", False)
    umbrella_verdict = vocab["carry_umbrella"] if umbrella_needed or rain_prob >= 35 else vocab["not_needed"]

    forecast_info = weather_context.get("forecast", {})
    daily_list = forecast_info.get("daily_structured", []) if isinstance(forecast_info, dict) else []
    tomorrow_day = daily_list[1] if len(daily_list) > 1 else None

    msg_lower = user_message.lower()

    is_tomorrow = any(w in msg_lower for w in [
        "tomorrow", "कल", "কাল", "उद्या", "రేపు", "நாளை", "આવતીકાલે", "કાલે", "کل", "ನಾಳೆ", "ଆସନ୍ତାକାଲି", "നാളെ"
    ])

    # Determine intent
    is_rain = any(w in msg_lower for w in [
        "rain", "umbrella", "wet", "shower", "drizzle", "बारिश", "पानी", "छाता", "बरसात",
        "বৃষ্টি", "ছাতা", "पाऊस", "छत्री", "వర్షం", "వాన", "గొడుగు", "மழை", "குடை",
        "વરસાદ", "છત્રી", "بارش", "چھتری", "ಮಳೆ", "ಛತ್ರಿ", "ବର୍ଷା", "ଛତା", "മഴ", "കുട"
    ])

    is_activity = any(w in msg_lower for w in [
        "run", "jog", "walk", "bike", "cycle", "ride", "outdoor", "exercise", "sports",
        "दौड़", "घूमना", "व्यायाम", "খেলা", "দৌড়", "धावणे", "सायकल", "రన్నింగ్", "నడక",
        "ഓട്ടം", "നടത്തം", "ഓടുക"
    ])

    is_clothing = any(w in msg_lower for w in [
        "wear", "cloth", "jacket", "coat", "dress", "outfit", "कपड़े", "পোশাক", "कपडे",
        "దుస్తులు", "ஆடை", "કપડાં", "لباس", "ಉಡುಪು", "ପୋଷାକ", "വസ്ത്രം"
    ])

    is_temp = any(w in msg_lower for w in [
        "hot", "cold", "temp", "feel", "humid", "warm", "गर्मी", "ठंड", "तापमान",
        "গরম", "ঠান্ডা", "थंडी", "ఉష్ణోగ్రత", "వేడి", "చలి", "சூடு", "குளிர்",
        "ગરમી", "ઠંડી", "گرمی", "سردی", "ಶಾಖ", "ಚಳಿ", "ଗରମ", "ଶୀତ", "ചൂട്", "തണുപ്പ്"
    ])

    response_lines = []

    if is_tomorrow and tomorrow_day and (is_rain or "forecast" in msg_lower or any(w in msg_lower for w in ["వాతావరణం", "मौसम", "আবহাওয়া", "हवामान", "வானிலை", "ಹವಾಮಾನ", "پାଣିପାଗ", "കാലാവസ്ഥ", "موسم"])):
        t_temp_max = tomorrow_day.get("temp_max", temp)
        t_temp_min = tomorrow_day.get("temp_min", temp)
        t_rain_prob = tomorrow_day.get("precipitation_probability", rain_prob)
        t_code = tomorrow_day.get("weather_code", code)
        t_cond = get_localized_weather_description(t_code, norm)
        t_umbrella_verdict = vocab["carry_umbrella"] if t_rain_prob >= 35 or umbrella_needed else vocab["not_needed"]
        t_outlook_text = vocab["rain_likely"] if t_rain_prob >= 40 else vocab["mostly_dry"]

        response_lines.append(f"{vocab['precip_outlook']}: {t_outlook_text}")
        response_lines.append(f"{vocab['rain_prob_6h']}: {t_rain_prob}%")
        response_lines.append(f"{vocab['umbrella_rec']}: {t_umbrella_verdict}")
        response_lines.append(f"{vocab['insight']}: {t_cond} ({t_temp_max}°C / {t_temp_min}°C)")

    elif is_rain:
        outlook_text = vocab["rain_likely"] if rain_prob >= 40 else vocab["mostly_dry"]
        response_lines.append(f"{vocab['precip_outlook']}: {outlook_text}")
        response_lines.append(f"{vocab['rain_prob_6h']}: {rain_prob}%")
        response_lines.append(f"{vocab['umbrella_rec']}: {umbrella_verdict}")
        if umbrella.get("rain_window") and "No" not in str(umbrella.get("rain_window", "")):
            response_lines.append(f"{vocab['expected_window']}: {umbrella.get('rain_window')}")

    elif is_activity:
        status_text = vocab["comfortable"] if rain_prob < 40 else vocab["rain_likely"]
        response_lines.append(f"{vocab['activity_assess']}: {status_text}")
        response_lines.append(f"{vocab['rain_prob_6h']}: {rain_prob}%")
        response_lines.append(f"{vocab['walking_suit']}: {status_text}")

    elif is_clothing:
        clothing_sugg = "Light and breathable clothing" if float(temp) >= 25 else ("Warm layering recommended" if float(temp) <= 15 else "Comfortable casual attire")
        if norm == "hi-IN":
            clothing_sugg = "हल्के और आरामदायक सूती कपड़े पहनें।" if float(temp) >= 25 else ("गर्म कपड़े या जैकेट पहनें।" if float(temp) <= 15 else "साधारण आरामदायक कपड़े उपयुक्त हैं।")
        elif norm == "te-IN":
            clothing_sugg = "తేలికపాటి సౌకర్యవంతమైన కాటన్ దుస్తులు అనుకూలం." if float(temp) >= 25 else ("వెచ్చని దుస్తులు లేదా జాకెట్ ధరించండి." if float(temp) <= 15 else "సాధారణ సౌకర్యవంతమైన దుస్తులు సరిపోతాయి.")
        elif norm == "ta-IN":
            clothing_sugg = "லேசான பருத்தி ஆடைகள் சிறந்தது." if float(temp) >= 25 else ("வெதுவெதுப்பான ஆடைகள் அல்லது ஜாக்கெட் அணியுங்கள்." if float(temp) <= 15 else "சாதாரண சௌகரியமான ஆடைகள் போதுமானது.")
        elif norm == "bn-IN":
            clothing_sugg = "হালকা ও আরামদায়ক সুতির পোশাক উপযুক্ত।" if float(temp) >= 25 else ("উষ্ণ পোশাক বা জ্যাकेट পরুন।" if float(temp) <= 15 else "সাধারণ আরামদায়ক পোশাক উপযুক্ত।")
        elif norm == "mr-IN":
            clothing_sugg = "हलके आणि आरामदायक सुती कपडे वापरा." if float(temp) >= 25 else ("उबदार कपडे किंवा जॅकेट वापरा." if float(temp) <= 15 else "साधे आरामदायक कपडे योग्य आहेत.")
        elif norm == "gu-IN":
            clothing_sugg = "હળવા અને આરામદાયક સુતરાઉ કપડાં પહેરો." if float(temp) >= 25 else ("ગરમ કપડાં અથવા જેકેટ પહેરો." if float(temp) <= 15 else "સામાન્ય આરામદાયક કપડાં યોગ્ય છે.")
        elif norm == "ur-IN":
            clothing_sugg = "ہلکے اور آرام دہ سوتی کپڑے پہنیں۔" if float(temp) >= 25 else ("گرم کپڑے یا جیکٹ پہنیں۔" if float(temp) <= 15 else "عام آرام دہ لباس مناسب ہے۔")
        elif norm == "kn-IN":
            clothing_sugg = "ಹಗುರವಾದ ಹತ್ತಿ ಬಟ್ಟೆಗಳನ್ನು ಧರಿಸಿ." if float(temp) >= 25 else ("ಬೆಚ್ಚಗಿನ ಬಟ್ಟೆ ಅಥವಾ ಜಾಕೆಟ್ ಧರಿಸಿ." if float(temp) <= 15 else "ಸಾಮಾನ್ಯ ಆರಾಮದಾಯಕ ಉಡುಪು ಸಾಕು.")
        elif norm == "or-IN":
            clothing_sugg = "ହାଲୁକା ଏବଂ ଆରାମଦାୟକ ସୂତା ପୋଷାକ ପିନ୍ଧନ୍ତୁ।" if float(temp) >= 25 else ("ଗରମ ପୋଷାକ କିମ୍ବା ଜ୍ୟାକେଟ୍ ପିନ୍ଧନ୍ତୁ।" if float(temp) <= 15 else "ସାଧାରଣ ଆରାମଦାୟକ ପୋଷାକ ଉପଯୁକ୍ତ।")
        elif norm == "ml-IN":
            clothing_sugg = "നേർത്ത കോട്ടൺ വസ്ത്രങ്ങൾ ധരിക്കുക." if float(temp) >= 25 else ("ചൂട് നൽകുന്ന വസ്ത്രങ്ങൾ അല്ലെങ്കിൽ ജാക്കറ്റ് ധരിക്കുക." if float(temp) <= 15 else "സാധാരണ സുഖകരമായ വസ്ത്രങ്ങൾ അനുയോജ്യമാണ്.")

        response_lines.append(f"{vocab['clothing_sugg']}: {clothing_sugg}")
        response_lines.append(f"{vocab['temp_comfort']}: {temp}°C ({vocab['feels_like']} {feels}°C)")

    elif is_temp:
        response_lines.append(f"{vocab['temp_comfort']}: {vocab['currently']} {temp}°C ({vocab['feels_like']} {feels}°C), {vocab['humidity']}: {humidity}%, {vocab['wind']}: {wind} km/h.")
        response_lines.append(f"{vocab['insight']}: {cond}")

    else:
        response_lines.append(f"{vocab['weather_overview']}: {vocab['currently']} {temp}°C ({cond}), {vocab['feels_like']} {feels}°C, {vocab['humidity']}: {humidity}%, {vocab['wind']}: {wind} km/h.")
        response_lines.append(f"{vocab['rain_prob_6h']}: {rain_prob}%")
        response_lines.append(f"{vocab['umbrella_rec']}: {umbrella_verdict}")

    # Alerts
    alerts_list = alerts_info.get("alerts", [])
    active_warnings = [a for a in alerts_list if a.get("severity") in ("warning", "advisory")]
    if active_warnings:
        response_lines.append(f"{vocab['active_alert']}: {active_warnings[0]['title']} — {active_warnings[0]['message']}")

    response_lines.append(f"\n{vocab['data_source']}")
    return "\n".join(response_lines)


def generate_localized_explanation(
    current: Dict[str, Any],
    location_name: Optional[str] = None,
    language_code: Optional[str] = None,
    language: Optional[str] = None
) -> str:
    """
    Generates a localized 'Explain My Weather' explanation sensation text.
    """
    lang = language or language_code or "en-IN"
    norm = normalize_language_code(lang)
    temp = float(current.get("temperature", 20.0))
    feels = float(current.get("feels_like", temp))
    humidity = int(current.get("humidity", 50))
    wind = float(current.get("wind_speed", 10.0))
    code = current.get("weather_code", 0)
    cond = get_localized_weather_description(code, norm)
    loc = location_name or "your area"

    if norm == "te-IN":
        if feels > temp + 1:
            return f"{loc}లో ఉష్ణోగ్రత {temp}°C గా ఉన్నప్పటికీ, అధిక తేమ ({humidity}%) వల్ల ఇది {feels}°C లా వేడిగా అనిపిస్తుంది. వాతావరణం {cond} గా ఉంది."
        elif feels < temp - 1:
            return f"{loc}లో ఉష్ణోగ్రత {temp}°C వద్ద నమోదవుతున్నప్పటికీ, {wind} km/h వేగంతో వీచే గాలుల వల్ల {feels}°C లా చల్లగా అనిపిస్తుంది. వాతావరణం {cond} గా ఉంది."
        return f"{loc}లో ఉష్ణోగ్రత {temp}°C ({feels}°C అనుభూతి) వద్ద సమతుల్య తేమ ({humidity}%) మరియు అనుకూలమైన {cond} వాతావరణంతో ప్రశాంతంగా ఉంది."

    elif norm == "hi-IN":
        if feels > temp + 1:
            return f"{loc} में तापमान {temp}°C है, लेकिन अधिक आर्द्रता ({humidity}%) के कारण यह {feels}°C जैसा गर्म महसूस हो रहा है। मौसम {cond} है।"
        elif feels < temp - 1:
            return f"{loc} में तापमान {temp}°C है, लेकिन {wind} km/h की हवा के कारण यह {feels}°C जितना ठंडा महसूस हो रहा है। मौसम {cond} है।"
        return f"{loc} में तापमान {temp}°C ({feels}°C अहसास) पर संतुलित आर्द्रता ({humidity}%) और सुखद {cond} मौसम के साथ स्थिर है।"

    elif norm == "bn-IN":
        if feels > temp + 1:
            return f"{loc}-এ তাপমাত্রা {temp}°C হলেও উচ্চ আর্দ্রতার ({humidity}%) কারণে এটি {feels}°C-এর মতো উষ্ণ অনুভূত হচ্ছে। আকাশ {cond}।"
        elif feels < temp - 1:
            return f"{loc}-এ তাপমাত্রা {temp}°C হলেও {wind} কিমি/ঘণ্টা বাতাসের কারণে এটি {feels}°C-এর মতো শীতল অনুভূত হচ্ছে। আকাশ {cond}।"
        return f"{loc}-এ তাপমাত্রা {temp}°C ({feels}°C অনুভূতি) এবং আর্দ্রতা {humidity}% সহ মনোরম {cond} আবহাওয়া বিরাজ করছে।"

    elif norm == "mr-IN":
        if feels > temp + 1:
            return f"{loc} मध्ये तापमान {temp}°C असले तरी जास्त आर्द्रतेमुळे ({humidity}%) ते {feels}°C इतके उबदार जाणवत आहे. हवामान {cond} आहे."
        elif feels < temp - 1:
            return f"{loc} मध्ये तापमान {temp}°C असले तरी {wind} किमी/तास वेगाच्या वाऱ्यामुळे ते {feels}°C इतके थंड जाणवत आहे. हवामान {cond} आहे."
        return f"{loc} मध्ये तापमान {temp}°C ({feels}°C जाणीव) आणि संतुलित आर्द्रतेसह ({humidity}%) सुखद {cond} हवामान आहे."

    elif norm == "ta-IN":
        if feels > temp + 1:
            return f"{loc} பகுதியில் வெப்பநிலை {temp}°C ஆக இருந்தாலும், அதிக ஈரப்பதம் ({humidity}%) காரணமாக இது {feels}°C போன்று வெப்பமாக உணரப்படுகிறது. வானிலை {cond} ஆக உள்ளது."
        elif feels < temp - 1:
            return f"{loc} பகுதியில் வெப்பநிலை {temp}°C ஆக இருந்தாலும், {wind} கிமீ/மணி வேகக் காற்று காரணமாக {feels}°C போன்று குளிராக உணரப்படுகிறது. வானிலை {cond} ஆக உள்ளது."
        return f"{loc} பகுதியில் வெப்பநிலை {temp}°C ({feels}°C உணர்வு) மற்றும் சீரான ஈரப்பதத்துடன் ({humidity}%) இதமான {cond} வானிலை நிலவுகிறது."

    elif norm == "gu-IN":
        if feels > temp + 1:
            return f"{loc}માં તાપમાન {temp}°C હોવા છતાં, વધુ ભેજ ({humidity}%)ને કારણે તે {feels}°C જેવું ગરમ લાગે છે. હવામાન {cond} છે."
        elif feels < temp - 1:
            return f"{loc}માં તાપમાન {temp}°C હોવા છતાં, {wind} કિમી/કલાકના પવનને કારણે તે {feels}°C જેવું ઠંડું લાગે છે. હવામાન {cond} છે."
        return f"{loc}માં તાપમાન {temp}°C ({feels}°C અનુભૂતિ) અને સંતુલિત ભેજ ({humidity}%) સાથે સુખદ {cond} હવામાન છે."

    elif norm == "ur-IN":
        if feels > temp + 1:
            return f"{loc} میں درجہ حرارت {temp}°C ہے، لیکن زیادہ نمی ({humidity}%) کی وجہ سے یہ {feels}°C جیسا گرم محسوس ہو رہا ہے۔ موسم {cond} ہے۔"
        elif feels < temp - 1:
            return f"{loc} میں درجہ حرارت {temp}°C ہے، لیکن {wind} کلومیٹر فی گھنٹہ کی ہوا کی وجہ سے یہ {feels}°C جتنا ٹھنڈا محسوس ہو رہا ہے۔ موسم {cond} ہے۔"
        return f"{loc} میں درجہ حرارت {temp}°C ({feels}°C احساس) اور متوازن نمی ({humidity}%) کے ساتھ خوشگوار {cond} موسم ہے۔"

    elif norm == "kn-IN":
        if feels > temp + 1:
            return f"{loc}ನಲ್ಲಿ ತಾಪಮಾನ {temp}°C ಇದ್ದರೂ, ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ({humidity}%) ಇದು {feels}°C ನಂತೆ ಬೆಚ್ಚಗೆ ಭಾಸವಾಗುತ್ತಿದೆ. ಹವಾಮಾನವು {cond} ಆಗಿದೆ."
        elif feels < temp - 1:
            return f"{loc}ನಲ್ಲಿ ತಾಪಮಾನ {temp}°C ಇದ್ದರೂ, {wind} ಕಿಮೀ/ಗಂ ಗಾಳಿಯಿಂದಾಗಿ ಇದು {feels}°C ನಂತೆ ತಂಪಾಗಿ ಭಾಸವಾಗುತ್ತಿದೆ. ಹವಾಮಾನವು {cond} ಆಗಿದೆ."
        return f"{loc}ನಲ್ಲಿ ತಾಪಮಾನ {temp}°C ({feels}°C ಅನುಭವ) ಮತ್ತು ಸಮತೋಲಿತ ಆರ್ದ್ರತೆಯೊಂದಿಗೆ ({humidity}%) ಆಹ್ಲಾದಕರ {cond} ಹವಾಮಾನವಿದೆ."

    elif norm == "or-IN":
        if feels > temp + 1:
            return f"{loc}ରେ ତାପମାତ୍ରା {temp}°C ଥିଲେ ମଧ୍ୟ ଅଧିକ ଆର୍ଦ୍ରତା ({humidity}%) ଯୋଗୁଁ ଏହା {feels}°C ଭଳି ଗରମ ଅନୁଭୂତ ହେଉଛି। ପାଣିପାଗ {cond} ଅଛି।"
        elif feels < temp - 1:
            return f"{loc}ରେ ତାପମାତ୍ରା {temp}°C ଥିଲେ ମଧ୍ୟ {wind} କିମି/ଘଣ୍ଟା ପବନ ଯୋଗୁଁ ଏହା {feels}°C ଭଳି ଥଣ୍ଡା ଅନୁଭୂତ ହେଉଛି। ପାଣିପାଗ {cond} ଅଛି।"
        return f"{loc}ରେ ତାପମାତ୍ରା {temp}°C ({feels}°C ଅନୁଭୂତି) ଏବଂ ସନ୍ତୁଳିତ ଆର୍ଦ୍ରତା ({humidity}%) ସହ ଆରାମଦାୟକ {cond} ପାଣିପାଗ ରହିଛି।"

    elif norm == "ml-IN":
        if feels > temp + 1:
            return f"{loc}-ൽ താപനില {temp}°C ആണെങ്കിലും, ഉയർന്ന ഈർപ്പം ({humidity}%) കാരണം ഇത് {feels}°C പോലെ ചൂടായി അനുഭവപ്പെടുന്നു. കാലാവസ്ഥ {cond} ആണ്."
        elif feels < temp - 1:
            return f"{loc}-ൽ താപനില {temp}°C ആണെങ്കിലും, {wind} കിമീ/മണിക്കൂർ കാറ്റ് കാരണം ഇത് {feels}°C പോലെ തണുപ്പായി അനുഭവപ്പെടുന്നു. കാലാവസ്ഥ {cond} ആണ്."
        return f"{loc}-ൽ താപനില {temp}°C ({feels}°C അനുഭവം) ഉം അനുയോജ്യമായ ഈർപ്പവും ({humidity}%) ഉള്ള സുഖകരമായ {cond} കാലാവസ്ഥയാണ്."

    # Default English
    if feels > temp + 1:
        return f"At {temp}°C, the air feels noticeably warmer ({feels}°C) because humidity ({humidity}%) reduces evaporative cooling. Conditions are {cond}."
    elif feels < temp - 1:
        return f"While the temperature reads {temp}°C, winds of {wind} km/h create a cooling effect making it feel like {feels}°C. Conditions are {cond}."
    return f"Temperatures are comfortable at {temp}°C (feels like {feels}°C) with balanced {humidity}% humidity and {cond} skies."


# Convenience aliases
get_wmo_description = get_localized_weather_description
generate_localized_weather_explainer = generate_localized_explanation

