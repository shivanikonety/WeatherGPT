# WeatherGPT 🌦️
**Modern AI Weather Intelligence & Practical Decision Assistant**

WeatherGPT is a high-accuracy, reliable, and conversational weather intelligence platform designed to transform raw meteorological data into actionable human decisions. Unlike standard weather apps that display raw numbers, WeatherGPT answers questions like *"Should I carry an umbrella?"*, *"What should I wear today?"*, and *"How does today compare with tomorrow?"*.

---

## 🌟 Key Features

### 1. 🛡️ Accuracy First & Zero Hallucinations
- **Strict Data Pipeline**: `WEATHER DATA (Open-Meteo) → TOOL/API → STRUCTURED DATA → AI INTERPRETATION → USER`
- The AI **never** invents temperatures, precipitation, wind speeds, or conditions.
- **Deterministic Rule-Based Fallback**: If the LLM API is ever offline or rate-limited, the system automatically generates structured natural-language answers directly from tool calculations without throwing 500 errors.

### 2. 🧭 Weather Impact Advisor
- **Umbrella Verdict**: Clear binary recommendation (*"Definite Yes"*, *"Recommended"*, *"Standby"*, *"Not Needed"*) with exact rain probability and hourly rain window.
- **Clothing & Layering**: Layer count suggestions, fabric recommendations, and accessory checklist (*sunglasses, beanie, rain jacket*).
- **Outdoor Activity Suitability**: Dynamic 0–100 scoring for **Running**, **Cycling**, **Patio Dining**, and **Walking**.
- **Travel Comfort & Road Traction**: Real-time road hazard evaluation (wet traction, fog visibility, wind hazards).
- **Health & Comfort**: Hydration targets, UV protection level (SPF 30+), and thermal sensation explanation.

### 3. ⏱️ Weather Timeline Intelligence
- **Diurnal Phase Breakdown**: Human-friendly segmentation into **Morning** (06:00–12:00), **Afternoon** (12:00–18:00), **Evening** (18:00–22:00), and **Overnight** (22:00–06:00) with condition icons and trend summary.
- **24-Hour Hourly Scrubber**: Interactive hourly progression tracking temperature, feels-like, and precipitation chance.

### 4. ⚖️ Weather Comparison Hub
- **Today vs Tomorrow**: Live delta calculations for temperature swing (°C/°F), precipitation risk shift (%), wind differences, and comparative AI summary.
- **City vs City**: Side-by-side comparative analysis of two different cities worldwide with instant delta breakdown.

### 5. 🚨 Smart Weather Alert Center
- Dynamic rule engine that continuously inspects forecast models to detect:
  - Imminent rain within 1–3 hours
  - Severe thunderstorm risk
  - Extreme heat index / sub-zero freezing warnings
  - High wind gusts (>50 km/h)
  - Dangerous UV levels (UV Index ≥ 8)

### 6. ✨ "Explain My Weather"
- One-click instant plain-language synthesis explaining why the weather feels the way it does (humidity impact, wind chill, sun intensity).

### 7. 💬 Conversational AI Weather Assistant
- Natural language chat assistant with multi-turn conversation memory, quick prompt chips, markdown formatting, and data source attribution.

### 8. 🔍 Natural Language Search & Memory
- Supports natural queries: `"Tokyo tomorrow"`, `"Weather in Mumbai this weekend"`, `"London vs Paris"`.
- Browser LocalStorage remembers pinned favorite cities and recent searches with 1-click loading.
- Instant unit toggle (**°C Metric** ↔ **°F Imperial**) and Theme switch (**Dark** ↔ **Light**).

---

## 🏗️ Architecture & Project Structure

```
WeatherGPT/
├── app/
│   ├── config.py              # Application settings & environment variables
│   ├── main.py                # FastAPI routes, CORS, static file mounting
│   ├── schemas/
│   │   └── weather.py         # Pydantic schemas (Queries, Chat, Impact, Comparison)
│   ├── services/
│   │   ├── agent.py           # Unified weather context aggregator
│   │   ├── cache.py           # In-memory caching layer with TTL
│   │   ├── comparison.py      # Day-to-day & dual-location comparison engine
│   │   ├── llm.py             # Grounded Groq LLM integration & fallback engine
│   │   ├── nlp.py             # Natural query parser & location intent extractor
│   │   └── timeline.py        # Diurnal phase & 24h timeline generator
│   ├── static/
│   │   ├── css/styles.css     # Glassmorphic CSS design system
│   │   ├── js/app.js          # Reactive client-side application controller
│   │   └── index.html         # Accessible, responsive HTML5 dashboard
│   ├── tools/
│   │   ├── advisory.py        # Weather Impact Advisor & Activity scoring
│   │   ├── alerts.py          # Real-data Smart Weather Alert engine
│   │   ├── decision.py        # Context-aware activity decision rules
│   │   ├── geocode.py         # Open-Meteo geocoding search
│   │   └── weather.py         # Open-Meteo current, forecast & air quality tools
│   └── utils/
│       ├── conversions.py     # Unit conversions (Metric ↔ Imperial)
│       └── weather_codes.py   # WMO weather code metadata & iconography
├── tests/
│   ├── test_weather_gpt.py    # Unit & integration test suite
│   └── test_edge_cases.py     # Edge cases, bounds, and NLP tests
├── requirements.txt           # Python package dependencies
├── .env                       # Environment configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- (Optional) Groq API key for AI reasoning (a fallback engine is included automatically)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/WeatherGPT.git
cd WeatherGPT

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Create or edit `.env` in the project root:
```env
APP_NAME=WeatherGPT
APP_VERSION=2.0.0
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_AIR_QUALITY_URL=https://air-quality-api.open-meteo.com/v1/air-quality
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Running the Application
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open your browser and navigate to:
**`http://127.0.0.1:8000`**

---

## 🧪 Running Tests
```bash
python -m unittest discover tests
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Web application dashboard (`index.html`) |
| `GET` | `/health` | Application health check |
| `POST` | `/weather/current` | Current weather with air quality & metadata |
| `POST` | `/weather/forecast` | 1–16 day hourly & daily structured forecast |
| `POST` | `/weather/impact` | Weather Impact Advisor report |
| `POST` | `/weather/timeline` | Diurnal phase breakdown & 24h scrubber |
| `POST` | `/weather/compare` | Today vs Tomorrow or City vs City comparison |
| `POST` | `/weather/explain` | AI plain-language "Explain My Weather" synthesis |
| `POST` | `/weather/natural-search` | NLP location & date intent extractor |
| `POST` | `/alerts` | Dynamic smart weather alert engine |
| `POST` | `/advisory` | Backward-compatible advisory endpoint |
| `POST` | `/chat` | Conversational AI weather assistant with history |
| `POST` | `/geocode` | Open-Meteo place search |

---

## 🔒 Security & Performance
- **Zero API Key Leakage**: LLM and weather tool keys remain strictly server-side.
- **In-Memory Caching**: 300-second TTL prevents duplicate API requests to Open-Meteo.
- **Input Validation**: Strict Pydantic models validate latitude `[-90, 90]`, longitude `[-180, 180]`, days `[1, 16]`, and query lengths.
- **Accessible UI**: ARIA tags, high color contrast, keyboard navigable, and mobile responsive.
