/**
 * WeatherGPT Application Controller — Stitch UI/UX Integration
 * Multilingual (11 Languages) + Voice + ChatGPT-style Conversation
 */

// Global Application State
const state = {
  location: {
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York"
  },
  units: localStorage.getItem("weathergpt_units") || "metric",
  theme: localStorage.getItem("weathergpt_theme") || "light",
  lang: localStorage.getItem("weathergpt_lang") || "en-IN",
  speechEnabled: localStorage.getItem("weathergpt_speech") !== "false",
  currentTab: "assistant",
  currentAlerts: [],
  isLoading: false,
  lastWeatherData: null,
  lastTimelineData: null,
  lastForecastData: null,
  lastImpactData: null,
  lastComparisonData: null
};

// Make state globally accessible to modules expecting window.state
if (typeof window !== "undefined") {
  window.state = state;
}

// Material Symbol Weather Icon Mapping
const MATERIAL_ICON_MAP = {
  "sun": "wb_sunny",
  "sun-cloud": "partly_cloudy_day",
  "cloud-sun": "partly_cloudy_day",
  "cloud": "cloud",
  "fog": "foggy",
  "cloud-drizzle": "rainy",
  "cloud-rain": "rainy",
  "cloud-lightning-rain": "thunderstorm",
  "cloud-lightning": "thunderstorm",
  "snowflake": "ac_unit",
  "cloud-snow": "weather_snowy",
  "moon": "nights_stay",
  "wind": "air"
};

// DOM Elements Registry
const DOM = {
  // Navigation & Tabs
  navTabBtns: document.querySelectorAll(".nav-tab-btn"),
  tabContainers: {
    assistant: document.getElementById("tabContentAssistant"),
    alerts: document.getElementById("tabContentAlerts"),
    advisory: document.getElementById("tabContentAdvisory"),
    comparison: document.getElementById("tabContentComparison"),
    settings: document.getElementById("tabContentSettings"),
  },

  // Header Elements
  headerCityName: document.getElementById("headerCityName"),
  locationPickerBtn: document.getElementById("locationPickerBtn"),
  langSelectorBtn: document.getElementById("langSelectorBtn"),
  headerLangName: document.getElementById("headerLangName"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIcon: document.getElementById("themeIcon"),
  voiceTriggerBtn: document.getElementById("voiceTriggerBtn"),
  headerVoiceIcon: document.getElementById("headerVoiceIcon"),
  syncStatusText: document.getElementById("syncStatusText"),

  // Search
  searchInput: document.getElementById("searchInput"),
  searchDropdown: document.getElementById("searchDropdown"),

  // Banners
  alertBannerBox: document.getElementById("alertBannerBox"),
  bannerAlertTag: document.getElementById("bannerAlertTag"),
  bannerAlertTitle: document.getElementById("bannerAlertTitle"),
  bannerAlertMsg: document.getElementById("bannerAlertMsg"),
  bannerTapDetails: document.getElementById("bannerTapDetails"),
  openAlertModalBtn: document.getElementById("openAlertModalBtn"),
  dismissAlertBtn: document.getElementById("dismissAlertBtn"),

  errorBanner: document.getElementById("errorBanner"),
  errorMessage: document.getElementById("errorMessage"),
  errorRetryBtn: document.getElementById("errorRetryBtn"),

  // Hero Card
  heroCity: document.getElementById("heroCity"),
  heroCountry: document.getElementById("heroCountry"),
  heroDateTime: document.getElementById("heroDateTime"),
  heroTemp: document.getElementById("heroTemp"),
  heroIcon: document.getElementById("heroIcon"),
  heroCondition: document.getElementById("heroCondition"),
  heroFeelsLike: document.getElementById("heroFeelsLike"),
  heroFeelsLikeWrap: document.getElementById("heroFeelsLikeWrap"),
  heroHigh: document.getElementById("heroHigh"),
  heroLow: document.getElementById("heroLow"),
  heroHighLowWrap: document.getElementById("heroHighLowWrap"),
  heroStationBadge: document.getElementById("heroStationBadge"),

  // Meteorological Grid
  metricHumidity: document.getElementById("metricHumidity"),
  metricHumiditySub: document.getElementById("metricHumiditySub"),
  metricRainProb: document.getElementById("metricRainProb"),
  metricPrecipSum: document.getElementById("metricPrecipSum"),
  metricWind: document.getElementById("metricWind"),
  metricWindGusts: document.getElementById("metricWindGusts"),
  metricPressure: document.getElementById("metricPressure"),
  metricUV: document.getElementById("metricUV"),
  metricUVSub: document.getElementById("metricUVSub"),
  metricAQI: document.getElementById("metricAQI"),
  metricAQISub: document.getElementById("metricAQISub"),
  metricSunSchedule: document.getElementById("metricSunSchedule"),

  // Labels for dynamic translation
  labelHumidity: document.getElementById("labelHumidity"),
  labelRainChance: document.getElementById("labelRainChance"),
  labelWind: document.getElementById("labelWind"),
  labelPressure: document.getElementById("labelPressure"),
  labelSurfaceLevel: document.getElementById("labelSurfaceLevel"),
  labelUV: document.getElementById("labelUV"),
  labelAQI: document.getElementById("labelAQI"),
  labelSunSchedule: document.getElementById("labelSunSchedule"),
  labelSunriseSunset: document.getElementById("labelSunriseSunset"),

  // AI Insight / Explain
  aiInsightHeader: document.getElementById("aiInsightHeader"),
  badgeGrounded: document.getElementById("badgeGrounded"),
  explainText: document.getElementById("explainText"),
  reExplainBtn: document.getElementById("reExplainBtn"),

  // Quick Questions Chips
  quickQuestionsLabel: document.getElementById("quickQuestionsLabel"),
  quickQuestionsChips: document.getElementById("quickQuestionsChips"),

  // Timeline & Forecast
  timelineHeaderTitle: document.getElementById("timelineHeaderTitle"),
  hourlyReel: document.getElementById("hourlyReel"),
  timelineNarrative: document.getElementById("timelineNarrative"),
  forecastHeaderTitle: document.getElementById("forecastHeaderTitle"),
  swipeLabel: document.getElementById("swipeLabel"),
  forecastScrollGrid: document.getElementById("forecastScrollGrid"),

  // Chat
  chatTitle: document.getElementById("chatTitle"),
  chatMessagesArea: document.getElementById("chatMessagesArea"),
  chatInput: document.getElementById("chatInput"),
  chatMicBtn: document.getElementById("chatMicBtn"),
  chatSendBtn: document.getElementById("chatSendBtn"),
  newChatBtn: document.getElementById("newChatBtn"),
  clearChatBtn: document.getElementById("clearChatBtn"),

  // Alerts Tab
  alertsTabHeading: document.getElementById("alertsTabHeading"),
  alertsTabBadge: document.getElementById("alertsTabBadge"),
  alertsFullList: document.getElementById("alertsFullList"),

  // Advisory Tab
  advisoryTabHeading: document.getElementById("advisoryTabHeading"),
  impactCardUmbrellaTitle: document.getElementById("impactCardUmbrellaTitle"),
  advisoryUmbrellaVerdict: document.getElementById("advisoryUmbrellaVerdict"),
  advisoryUmbrellaReason: document.getElementById("advisoryUmbrellaReason"),
  advisoryUmbrellaWindow: document.getElementById("advisoryUmbrellaWindow"),
  advisoryClothingLayers: document.getElementById("advisoryClothingLayers"),
  advisoryClothingSummary: document.getElementById("advisoryClothingSummary"),
  advisoryClothingAccessories: document.getElementById("advisoryClothingAccessories"),
  advisoryTravelStatus: document.getElementById("advisoryTravelStatus"),
  advisoryTravelRoad: document.getElementById("advisoryTravelRoad"),
  advisoryTravelTip: document.getElementById("advisoryTravelTip"),
  advisoryHydration: document.getElementById("advisoryHydration"),
  advisoryUV: document.getElementById("advisoryUV"),
  gaugeRunningScore: document.getElementById("gaugeRunningScore"),
  gaugeRunningStatus: document.getElementById("gaugeRunningStatus"),
  gaugeCyclingScore: document.getElementById("gaugeCyclingScore"),
  gaugeCyclingStatus: document.getElementById("gaugeCyclingStatus"),
  gaugeDiningScore: document.getElementById("gaugeDiningScore"),
  gaugeDiningStatus: document.getElementById("gaugeDiningStatus"),
  gaugeWalkingScore: document.getElementById("gaugeWalkingScore"),
  gaugeWalkingStatus: document.getElementById("gaugeWalkingStatus"),
  labelGaugeRunning: document.getElementById("labelGaugeRunning"),
  labelGaugeCycling: document.getElementById("labelGaugeCycling"),
  labelGaugeDining: document.getElementById("labelGaugeDining"),
  labelGaugeWalking: document.getElementById("labelGaugeWalking"),

  // Comparison Tab
  comparisonTabHeading: document.getElementById("comparisonTabHeading"),
  compareTabDaysBtn: document.getElementById("compareTabDaysBtn"),
  compareTabCitiesBtn: document.getElementById("compareTabCitiesBtn"),
  compareDaysView: document.getElementById("compareDaysView"),
  compareCitiesView: document.getElementById("compareCitiesView"),
  labelCompDay1: document.getElementById("labelCompDay1"),
  compDay1Temp: document.getElementById("compDay1Temp"),
  compDay1Cond: document.getElementById("compDay1Cond"),
  compDay1Rain: document.getElementById("compDay1Rain"),
  labelCompDay2: document.getElementById("labelCompDay2"),
  compDay2Temp: document.getElementById("compDay2Temp"),
  compDay2Cond: document.getElementById("compDay2Cond"),
  compDay2Rain: document.getElementById("compDay2Rain"),
  compDeltasSummary: document.getElementById("compDeltasSummary"),
  compInsightText: document.getElementById("compInsightText"),
  city2Input: document.getElementById("city2Input"),
  runCityCompareBtn: document.getElementById("runCityCompareBtn"),
  cityCompareOutput: document.getElementById("cityCompareOutput"),

  // Settings Tab
  profileDisplayName: document.getElementById("profileDisplayName"),
  profileLocationSub: document.getElementById("profileLocationSub"),
  settingsUnitsHeading: document.getElementById("settingsUnitsHeading"),
  settingsTempUnitLabel: document.getElementById("settingsTempUnitLabel"),
  settingsThemeLabel: document.getElementById("settingsThemeLabel"),
  tempUnitGroup: document.getElementById("tempUnitGroup"),
  themeGroup: document.getElementById("themeGroup"),
  optThemeLight: document.getElementById("optThemeLight"),
  optThemeDark: document.getElementById("optThemeDark"),
  settingsAiVoiceHeading: document.getElementById("settingsAiVoiceHeading"),
  settingsSpeechOutputLabel: document.getElementById("settingsSpeechOutputLabel"),
  settingsSpeechOutputDesc: document.getElementById("settingsSpeechOutputDesc"),
  speechToggle: document.getElementById("speechToggle"),
  settingsLanguageLabel: document.getElementById("settingsLanguageLabel"),
  settingsLanguageDesc: document.getElementById("settingsLanguageDesc"),
  languageGridSelector: document.getElementById("languageGridSelector"),
  settingsAppAttribution: document.getElementById("settingsAppAttribution"),
  settingsSourceOfTruth: document.getElementById("settingsSourceOfTruth"),
  settingsNoHallucinations: document.getElementById("settingsNoHallucinations"),

  // Modals
  languageModal: document.getElementById("languageModal"),
  modalLangTitle: document.getElementById("modalLangTitle"),
  closeLangModalBtn: document.getElementById("closeLangModalBtn"),
  modalLangGrid: document.getElementById("modalLangGrid"),

  alertDetailModal: document.getElementById("alertDetailModal"),
  modalAlertTitle: document.getElementById("modalAlertTitle"),
  modalAlertContent: document.getElementById("modalAlertContent"),
  closeAlertModalBtn: document.getElementById("closeAlertModalBtn"),
  modalAcknowledgeBtn: document.getElementById("modalAcknowledgeBtn"),

  // Navigation tab labels
  navLabelAssistant: document.getElementById("navLabelAssistant"),
  navLabelAlerts: document.getElementById("navLabelAlerts"),
  navLabelAdvisory: document.getElementById("navLabelAdvisory"),
  navLabelCompare: document.getElementById("navLabelCompare"),
  navLabelSettings: document.getElementById("navLabelSettings"),
};

// ==========================================
// CENTRALIZED API CLIENT
// ==========================================

const API_BASE = (function () {
  if (typeof window !== "undefined" && window.location) {
    if (window.location.protocol.startsWith("http") && window.location.port === "8001") {
      return "";
    }
  }
  return "http://127.0.0.1:8001";
})();

async function apiRequest(endpoint, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 16000);

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and retry.");
    }
    throw err;
  }
}

if (typeof window !== "undefined") {
  window.apiRequest = apiRequest;
}

// ==========================================
// 1. INITIALIZATION & SETUP
// ==========================================

let voiceManager = null;
let chatController = null;

function initApp() {
  try {
    // 1. Ensure I18n is initialized
    if (typeof I18n !== "undefined" && I18n.setLanguage) {
      I18n.setLanguage(state.lang);
    }

    // 2. Initialize Voice Manager
    try {
      if (typeof VoiceManager !== "undefined") {
        voiceManager = new VoiceManager({
          language: state.lang,
          micButton: DOM.chatMicBtn,
          onResult: (transcript) => {
            if (DOM.chatInput) {
              DOM.chatInput.value = transcript;
              DOM.chatInput.dispatchEvent(new Event("input"));
              // Auto send if confident
              if (chatController) {
                chatController.sendMessage(transcript);
              }
            }
          },
          onError: (err) => {
            console.warn("Voice error:", err);
          }
        });
        if (voiceManager.setLanguage) {
          voiceManager.setLanguage(state.lang);
        }
        if (typeof window !== "undefined") {
          window.voiceManager = voiceManager;
        }
      }
    } catch (vErr) {
      console.warn("VoiceManager initialization error (non-fatal):", vErr);
    }

    // 3. Initialize Chat Controller
    try {
      if (typeof ChatController !== "undefined") {
        chatController = new ChatController({
          container: DOM.chatMessagesArea,
          input: DOM.chatInput,
          sendBtn: DOM.chatSendBtn,
          newChatBtn: DOM.newChatBtn,
          clearChatBtn: DOM.clearChatBtn,
          micBtn: DOM.chatMicBtn,
          voiceManager: voiceManager,
          getLocation: () => state.location,
          getUnits: () => state.units,
          getLang: () => state.lang,
          onSend: async (message, history) => {
            const res = await apiRequest("/chat", {
              message: message,
              latitude: state.location.latitude,
              longitude: state.location.longitude,
              location_name: state.location.name,
              units: state.units,
              language: state.lang,
              history: history.slice(-6)
            });
            return res.response;
          }
        });
        if (typeof window !== "undefined") {
          window.chatController = chatController;
        }
      }
    } catch (cErr) {
      console.warn("ChatController initialization error (non-fatal):", cErr);
    }

    // 4. Apply UI theme and language
    document.documentElement.setAttribute("data-theme", state.theme);
    updateThemeIcon();
    applyLanguage(state.lang, false);
    updateSettingsControls();

    // 5. Setup event listeners
    setupEventListeners();

    // 6. Load initial complete weather
    loadCompleteWeatherData();
  } catch (err) {
    console.error("Critical error in initApp:", err);
    loadCompleteWeatherData();
  }
}

function updateThemeIcon() {
  if (DOM.themeIcon) {
    DOM.themeIcon.textContent = state.theme === "dark" ? "light_mode" : "dark_mode";
  }
}

function switchTab(tabId) {
  state.currentTab = tabId;

  // Update nav buttons
  DOM.navTabBtns.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  // Update tab containers
  Object.keys(DOM.tabContainers).forEach(key => {
    if (DOM.tabContainers[key]) {
      DOM.tabContainers[key].style.display = key === tabId ? "block" : "none";
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// 2. MULTILINGUAL DISPATCHER & UI TRANSLATION
// ==========================================

function applyLanguage(lang, reloadWeather = false) {
  state.lang = lang;
  localStorage.setItem("weathergpt_lang", lang);
  if (typeof I18n !== "undefined" && I18n.setLanguage) {
    I18n.setLanguage(lang);
  }

  // Set HTML direction (Urdu = RTL)
  const dir = typeof I18n !== "undefined" && I18n.getDirection ? I18n.getDirection(lang) : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang.split("-")[0]);

  // Update Header Language Pill
  const languages = (typeof I18n !== "undefined" && (I18n.LANGUAGES || I18n.languages)) || (typeof LANGUAGES !== "undefined" ? LANGUAGES : {});
  const langConfig = (languages && languages[lang]) || (languages && languages["en-IN"]) || { name: "English", nativeName: "English" };
  if (DOM.headerLangName) {
    DOM.headerLangName.textContent = langConfig.nativeName || langConfig.name;
  }

  // Update Voice Manager locale
  if (voiceManager && voiceManager.setLanguage) {
    voiceManager.setLanguage(lang);
  }

  // Translate all UI strings
  translateStaticUI(lang);

  // Update quick action question chips
  updateQuickQuestionChips(lang);

  // Update active state on language selector cards (Modal & Settings)
  document.querySelectorAll(".lang-grid-card").forEach(card => {
    card.classList.toggle("active", card.getAttribute("data-lang") === lang);
  });

  // If weather is already loaded, update localized weather condition strings in-place
  if (state.lastWeatherData) {
    updateLocalizedWeatherDisplays();
  }

  // If Chat is initialized, render translated history
  if (chatController) {
    if (typeof chatController.renderHistory === "function") {
      chatController.renderHistory();
    } else if (typeof chatController.render === "function") {
      chatController.render();
    }
  }

  // If reloadWeather requested, re-explain and reload
  if (reloadWeather) {
    loadCompleteWeatherData();
  }
}

function translateStaticUI(lang) {
  const t = (k) => I18n.t(k, lang);

  // Nav tabs
  if (DOM.navLabelAssistant) DOM.navLabelAssistant.textContent = t("nav_assistant");
  if (DOM.navLabelAlerts) DOM.navLabelAlerts.textContent = t("nav_alerts");
  if (DOM.navLabelAdvisory) DOM.navLabelAdvisory.textContent = t("nav_advisory");
  if (DOM.navLabelCompare) DOM.navLabelCompare.textContent = t("nav_compare");
  if (DOM.navLabelSettings) DOM.navLabelSettings.textContent = t("nav_settings");

  // Search input placeholder
  if (DOM.searchInput) DOM.searchInput.placeholder = t("search_placeholder");

  // Hero labels
  if (DOM.labelHumidity) DOM.labelHumidity.textContent = t("metric_humidity");
  if (DOM.labelRainChance) DOM.labelRainChance.textContent = t("metric_rain");
  if (DOM.labelWind) DOM.labelWind.textContent = t("metric_wind");
  if (DOM.labelPressure) DOM.labelPressure.textContent = t("metric_pressure");
  if (DOM.labelSurfaceLevel) DOM.labelSurfaceLevel.textContent = t("metric_pressure_sub");
  if (DOM.labelUV) DOM.labelUV.textContent = t("metric_uv");
  if (DOM.labelAQI) DOM.labelAQI.textContent = t("metric_aqi");
  if (DOM.labelSunSchedule) DOM.labelSunSchedule.textContent = t("metric_sun");
  if (DOM.labelSunriseSunset) DOM.labelSunriseSunset.textContent = t("metric_sun_sub");

  // AI Insight
  if (DOM.aiInsightHeader) DOM.aiInsightHeader.textContent = t("ai_insight_header");
  if (DOM.badgeGrounded) DOM.badgeGrounded.textContent = t("ai_insight_grounded");

  // Timeline & Forecast titles
  if (DOM.timelineHeaderTitle) DOM.timelineHeaderTitle.textContent = t("timeline_title");
  if (DOM.forecastHeaderTitle) DOM.forecastHeaderTitle.textContent = t("forecast_title");
  if (DOM.swipeLabel) DOM.swipeLabel.textContent = t("forecast_swipe");

  // Chat
  if (DOM.chatTitle) DOM.chatTitle.textContent = t("chat_title");
  if (DOM.chatInput) DOM.chatInput.placeholder = t("chat_placeholder");

  // Alerts Tab
  if (DOM.alertsTabHeading) DOM.alertsTabHeading.textContent = t("alerts_tab_heading");
  if (DOM.alertsTabBadge) DOM.alertsTabBadge.textContent = t("alerts_tab_badge");

  // Advisory Tab
  if (DOM.advisoryTabHeading) DOM.advisoryTabHeading.textContent = t("advisory_tab_heading");
  if (DOM.impactCardUmbrellaTitle) DOM.impactCardUmbrellaTitle.textContent = t("impact_umbrella");
  if (DOM.labelGaugeRunning) DOM.labelGaugeRunning.textContent = t("gauge_running");
  if (DOM.labelGaugeCycling) DOM.labelGaugeCycling.textContent = t("gauge_cycling");
  if (DOM.labelGaugeDining) DOM.labelGaugeDining.textContent = t("gauge_dining");
  if (DOM.labelGaugeWalking) DOM.labelGaugeWalking.textContent = t("gauge_walking");

  // Comparison Tab
  if (DOM.comparisonTabHeading) DOM.comparisonTabHeading.textContent = t("compare_tab_heading");
  if (DOM.compareTabDaysBtn) DOM.compareTabDaysBtn.textContent = t("compare_today_tomorrow");
  if (DOM.compareTabCitiesBtn) DOM.compareTabCitiesBtn.textContent = t("compare_two_cities");
  if (DOM.labelCompDay1) DOM.labelCompDay1.textContent = t("compare_today_label");
  if (DOM.labelCompDay2) DOM.labelCompDay2.textContent = t("compare_tomorrow_label");
  if (DOM.city2Input) DOM.city2Input.placeholder = t("city2_placeholder");
  if (DOM.runCityCompareBtn) DOM.runCityCompareBtn.textContent = t("compare_btn");

  // Settings Tab
  if (DOM.profileDisplayName) DOM.profileDisplayName.textContent = t("settings_user_profile");
  if (DOM.settingsUnitsHeading) DOM.settingsUnitsHeading.textContent = t("settings_units");
  if (DOM.settingsTempUnitLabel) DOM.settingsTempUnitLabel.textContent = t("settings_temp_unit");
  if (DOM.settingsThemeLabel) DOM.settingsThemeLabel.textContent = t("settings_theme");
  if (DOM.optThemeLight) DOM.optThemeLight.textContent = t("theme_light");
  if (DOM.optThemeDark) DOM.optThemeDark.textContent = t("theme_dark");
  if (DOM.settingsAiVoiceHeading) DOM.settingsAiVoiceHeading.textContent = t("settings_voice");
  if (DOM.settingsSpeechOutputLabel) DOM.settingsSpeechOutputLabel.textContent = t("settings_speech_out");
  if (DOM.settingsSpeechOutputDesc) DOM.settingsSpeechOutputDesc.textContent = t("settings_speech_desc");
  if (DOM.settingsLanguageLabel) DOM.settingsLanguageLabel.textContent = t("settings_lang");
  if (DOM.settingsLanguageDesc) DOM.settingsLanguageDesc.textContent = t("settings_lang_desc");
  if (DOM.settingsAppAttribution) DOM.settingsAppAttribution.textContent = t("settings_attribution");
  if (DOM.settingsSourceOfTruth) DOM.settingsSourceOfTruth.innerHTML = `${t("settings_source")} <a href="https://open-meteo.com" target="_blank" rel="noopener" style="color:var(--color-primary);font-weight:600;text-decoration:none;">Open-Meteo</a>`;
  if (DOM.settingsNoHallucinations) DOM.settingsNoHallucinations.textContent = t("settings_no_hallucination");

  // Modal
  if (DOM.modalLangTitle) DOM.modalLangTitle.textContent = t("select_language");
  if (DOM.modalAlertTitle) DOM.modalAlertTitle.textContent = t("modal_alert_title");
  if (DOM.modalAcknowledgeBtn) DOM.modalAcknowledgeBtn.textContent = t("modal_acknowledged");
  if (DOM.bannerTapDetails) DOM.bannerTapDetails.textContent = t("banner_tap_details");
  if (DOM.bannerAlertTag) DOM.bannerAlertTag.textContent = t("banner_alert_tag");
}

function updateQuickQuestionChips(lang) {
  if (!DOM.quickQuestionsChips) return;
  const chips = [
    { key: "umbrella", icon: "umbrella", text: I18n.t("chip_umbrella", lang) },
    { key: "clothing", icon: "checkroom", text: I18n.t("chip_clothing", lang) },
    { key: "cycling", icon: "directions_bike", text: I18n.t("chip_cycling", lang) },
    { key: "rain", icon: "rainy", text: I18n.t("chip_rain", lang) },
    { key: "temp", icon: "thermostat", text: I18n.t("chip_temp", lang) },
    { key: "compare", icon: "compare_arrows", text: I18n.t("chip_compare", lang) },
  ];

  if (DOM.quickQuestionsLabel) {
    DOM.quickQuestionsLabel.textContent = I18n.t("quick_questions", lang);
  }

  DOM.quickQuestionsChips.innerHTML = chips.map(c => `
    <button class="quick-action-chip" data-chip="${c.key}">
      <span class="material-symbols-outlined" style="font-size:16px;">${c.icon}</span>
      <span class="chip-text">${c.text}</span>
    </button>
  `).join("");
}

function updateLocalizedWeatherDisplays() {
  const w = state.lastWeatherData;
  if (!w) return;

  const isImp = state.units === "imperial";
  const feelsVal = isImp && w.feels_like_f !== undefined ? Math.round(w.feels_like_f) : Math.round(w.feels_like);
  const highVal = isImp && w.temp_max_f !== undefined ? Math.round(w.temp_max_f) : (w.temp_max !== null ? Math.round(w.temp_max) : "--");
  const lowVal = isImp && w.temp_min_f !== undefined ? Math.round(w.temp_min_f) : (w.temp_min !== null ? Math.round(w.temp_min) : "--");
  const unitSymbol = isImp ? "°F" : "°C";

  // Translate weather code description
  const wmoDesc = I18n.getWmoDescription(w.weather_code, state.lang) || w.weather_description || "Clear";
  DOM.heroCondition.textContent = wmoDesc;

  // Translate feels like / high low
  if (DOM.heroFeelsLikeWrap) {
    DOM.heroFeelsLikeWrap.innerHTML = `${I18n.t("hero_feels_like", state.lang)} <strong id="heroFeelsLike">${feelsVal}${unitSymbol}</strong>`;
  }
  if (DOM.heroHighLowWrap) {
    DOM.heroHighLowWrap.innerHTML = `${I18n.t("hero_high", state.lang)} <strong id="heroHigh">${highVal}${unitSymbol}</strong> / ${I18n.t("hero_low", state.lang)} <strong id="heroLow">${lowVal}${unitSymbol}</strong>`;
  }
}

// ==========================================
// 3. MASTER WEATHER LOADER
// ==========================================

async function loadCompleteWeatherData() {
  showError(false);
  state.isLoading = true;
  updateSyncStatus(I18n.t("sync_updating", state.lang) || "Updating live forecast...");

  const { latitude, longitude, name, country } = state.location;
  const units = state.units;
  const lang = state.lang;

  try {
    const [currentRes, forecastRes, impactRes, timelineRes, alertsRes, explainRes, compRes] = await Promise.all([
      apiRequest("/weather/current", { latitude, longitude, units, name, language: lang }),
      apiRequest("/weather/forecast", { latitude, longitude, days: 7, units, name, language: lang }),
      apiRequest("/weather/impact", { latitude, longitude, units, location_name: name, language: lang }),
      apiRequest("/weather/timeline", { latitude, longitude, days: 2, units, language: lang }),
      apiRequest("/alerts", { latitude, longitude, language: lang }),
      apiRequest("/weather/explain", { latitude, longitude, units, location_name: name, language: lang }),
      apiRequest("/weather/compare", { latitude, longitude, mode: "days", day1_offset: 0, day2_offset: 1, units, location_name: name, language: lang })
    ]);

    // Cache responses in state
    state.lastWeatherData = currentRes;
    state.lastForecastData = forecastRes;
    state.lastImpactData = impactRes;
    state.lastTimelineData = timelineRes;
    state.lastComparisonData = compRes;
    state.currentAlerts = alertsRes.alerts || [];

    // Render modules
    renderHero(currentRes, name, country);
    renderExplain(explainRes.explanation);
    renderAlertBanner(state.currentAlerts);
    renderTimeline(timelineRes);
    renderForecast(forecastRes);
    renderImpact(impactRes.impact);
    renderComparison(compRes);
    renderAlertsTab(state.currentAlerts);

    updateSyncStatus(I18n.t("sync_verified", state.lang) || "Weather data updated recently • Open-Meteo Verified");
    updateLocationDisplays(name, country);

  } catch (err) {
    console.error("Failed to load weather data:", err);
    showError(true, err.message || "Failed to load weather data.");
    updateSyncStatus(I18n.t("sync_failed", state.lang) || "Sync failed");
  } finally {
    state.isLoading = false;
  }
}

// ==========================================
// 4. UI RENDERERS
// ==========================================

function updateLocationDisplays(name, country) {
  const locStr = country ? `${name}, ${country}` : name;
  if (DOM.headerCityName) DOM.headerCityName.textContent = locStr;
  if (DOM.profileLocationSub) DOM.profileLocationSub.textContent = `${I18n.t("active_location", state.lang) || "Active Location"}: ${locStr}`;
}

function renderHero(w, name, country) {
  DOM.heroCity.textContent = name;
  DOM.heroCountry.textContent = country ? `${country} • ${I18n.t("local_forecast", state.lang) || "Local Forecast"}` : (I18n.t("local_forecast", state.lang) || "Local Forecast");

  const now = new Date();
  const locale = state.lang || "en-US";
  try {
    DOM.heroDateTime.textContent = now.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    DOM.heroDateTime.textContent = now.toLocaleString();
  }

  const isImp = state.units === "imperial";
  const tempVal = isImp && w.temperature_f !== undefined ? Math.round(w.temperature_f) : Math.round(w.temperature);
  const feelsVal = isImp && w.feels_like_f !== undefined ? Math.round(w.feels_like_f) : Math.round(w.feels_like);
  const highVal = isImp && w.temp_max_f !== undefined ? Math.round(w.temp_max_f) : (w.temp_max !== null ? Math.round(w.temp_max) : "--");
  const lowVal = isImp && w.temp_min_f !== undefined ? Math.round(w.temp_min_f) : (w.temp_min !== null ? Math.round(w.temp_min) : "--");
  const unitSymbol = isImp ? "°F" : "°C";

  DOM.heroTemp.textContent = `${tempVal}°`;
  DOM.heroCondition.textContent = I18n.getWmoDescription(w.weather_code, state.lang) || w.weather_description || "Clear";
  
  if (DOM.heroFeelsLikeWrap) {
    DOM.heroFeelsLikeWrap.innerHTML = `${I18n.t("hero_feels_like", state.lang)} <strong id="heroFeelsLike">${feelsVal}${unitSymbol}</strong>`;
  }
  if (DOM.heroHighLowWrap) {
    DOM.heroHighLowWrap.innerHTML = `${I18n.t("hero_high", state.lang)} <strong id="heroHigh">${highVal}${unitSymbol}</strong> / ${I18n.t("hero_low", state.lang)} <strong id="heroLow">${lowVal}${unitSymbol}</strong>`;
  }

  const iconName = MATERIAL_ICON_MAP[w.weather_icon] || "wb_sunny";
  DOM.heroIcon.innerHTML = `<span class="material-symbols-outlined" style="font-size:54px;">${iconName}</span>`;

  // Meteorological Grid
  DOM.metricHumidity.textContent = `${w.humidity}%`;
  DOM.metricHumiditySub.textContent = w.humidity > 75 ? "High Humidity" : (w.humidity < 35 ? "Dry Air" : "Comfortable");

  const rainP = w.precipitation ? Math.round(w.precipitation * 10) / 10 : 0;
  DOM.metricRainProb.textContent = rainP > 0 ? `${rainP} mm` : "0%";
  DOM.metricPrecipSum.textContent = isImp && w.precipitation_in !== undefined ? `${w.precipitation_in} in` : `${rainP} mm`;

  const windVal = isImp && w.wind_speed_mph !== undefined ? `${Math.round(w.wind_speed_mph)} mph` : `${Math.round(w.wind_speed)} km/h`;
  const gustVal = isImp && w.wind_gusts_mph !== undefined ? `${Math.round(w.wind_gusts_mph)} mph` : `${Math.round(w.wind_gusts || 0)} km/h`;
  DOM.metricWind.textContent = windVal;
  DOM.metricWindGusts.textContent = `Gusts: ${gustVal}`;

  DOM.metricPressure.textContent = w.surface_pressure ? `${Math.round(w.surface_pressure)} hPa` : "--";

  const uv = w.uv_index !== undefined ? Math.round(w.uv_index * 10) / 10 : 0;
  DOM.metricUV.textContent = `${uv}`;
  DOM.metricUVSub.textContent = uv >= 8 ? "Very High Risk" : (uv >= 6 ? "High (SPF 30+)" : (uv >= 3 ? "Moderate" : "Low"));

  const aq = w.air_quality || {};
  if (aq.us_aqi !== undefined && aq.us_aqi !== null) {
    DOM.metricAQI.textContent = `${aq.us_aqi}`;
    DOM.metricAQISub.textContent = `US AQI: ${aq.category || 'Good'}`;
  } else {
    DOM.metricAQI.textContent = "Good";
    DOM.metricAQISub.textContent = "Stable";
  }

  if (w.sunrise && w.sunset) {
    const sr = w.sunrise.split("T")[1] || "--";
    const ss = w.sunset.split("T")[1] || "--";
    DOM.metricSunSchedule.textContent = `${sr} / ${ss}`;
  }
}

function renderExplain(explanationText) {
  DOM.explainText.textContent = explanationText || I18n.t("ai_insight_loading", state.lang) || "Real-time AI meteorological synthesis completed.";
}

function renderAlertBanner(alerts) {
  const severeAlerts = (alerts || []).filter(a => a.severity === "warning" || a.severity === "advisory");
  if (!severeAlerts.length) {
    DOM.alertBannerBox.style.display = "none";
    return;
  }

  const topAlert = severeAlerts[0];
  DOM.bannerAlertTag.textContent = topAlert.severity === "warning" ? (I18n.t("banner_alert_tag", state.lang) || "Weather Alert") : (I18n.t("banner_alert_tag", state.lang) || "Advisory");
  DOM.bannerAlertTitle.textContent = topAlert.title;
  DOM.bannerAlertMsg.textContent = topAlert.message;
  DOM.alertBannerBox.style.display = "flex";
}

function renderTimeline(timeline) {
  if (!timeline) return;

  const isImp = state.units === "imperial";
  DOM.hourlyReel.innerHTML = "";

  const hours = timeline.hourly_24h || [];
  hours.forEach(h => {
    const item = document.createElement("div");
    item.className = "hourly-tile";
    const t = isImp && h.temp_f !== undefined ? Math.round(h.temp_f) : Math.round(h.temp);
    const icon = MATERIAL_ICON_MAP[h.icon] || (h.is_day ? "wb_sunny" : "nights_stay");

    item.innerHTML = `
      <span style="color:var(--text-muted);font-size:0.75rem;">${h.hour_label}</span>
      <span class="material-symbols-outlined" style="font-size:22px;color:var(--color-primary);">${icon}</span>
      <strong style="font-size:0.95rem;">${t}°</strong>
      <span style="font-size:0.7rem;color:var(--color-error);font-weight:600;">${h.precipitation_probability > 0 ? `${h.precipitation_probability}%` : '0%'}</span>
    `;
    DOM.hourlyReel.appendChild(item);
  });

  DOM.timelineNarrative.textContent = timeline.summary || "";
}

function renderForecast(forecast) {
  DOM.forecastScrollGrid.innerHTML = "";
  const daily = forecast.daily_structured || [];
  const isImp = state.units === "imperial";

  daily.forEach((d, idx) => {
    const item = document.createElement("div");
    const dateObj = new Date(d.date + "T00:00:00");
    const locale = state.lang || "en-US";
    let dayLabel = "Today";
    try {
      dayLabel = idx === 0 ? (I18n.t("compare_today_label", state.lang) || "Today") : dateObj.toLocaleDateString(locale, { weekday: "short" });
    } catch (e) {
      dayLabel = idx === 0 ? "Today" : d.date;
    }

    const minVal = isImp ? Math.round(d.temp_min_f) : Math.round(d.temp_min);
    const maxVal = isImp ? Math.round(d.temp_max_f) : Math.round(d.temp_max);
    const icon = MATERIAL_ICON_MAP[d.icon] || "wb_sunny";

    const isBest = idx === 3 || (d.precipitation_probability <= 10 && maxVal >= 20 && maxVal <= 30);
    item.className = `forecast-card-item ${isBest ? 'is-best' : ''}`;

    let suitBadge = `<span class="badge-suitability suit-good">Good</span>`;
    if (d.precipitation_probability >= 60) suitBadge = `<span class="badge-suitability suit-bad">Rainy</span>`;
    else if (d.precipitation_probability >= 30) suitBadge = `<span class="badge-suitability suit-warn">Showers</span>`;
    else if (isBest) suitBadge = `<span class="badge-suitability suit-good">Best Day ☀️</span>`;

    item.innerHTML = `
      <span style="font-size:0.8rem;font-weight:700;">${dayLabel}</span>
      <span style="font-size:0.7rem;color:var(--text-muted);">${d.date.slice(5)}</span>
      <span class="material-symbols-outlined" style="font-size:22px;color:var(--color-primary);">${icon}</span>
      <strong style="font-size:0.88rem;">${maxVal}° / ${minVal}°</strong>
      <span style="font-size:0.7rem;color:var(--color-error);font-weight:600;">${d.precipitation_probability}% Rain</span>
      ${suitBadge}
    `;
    DOM.forecastScrollGrid.appendChild(item);
  });
}

function renderImpact(impact) {
  if (!impact) return;

  const umb = impact.umbrella || {};
  DOM.advisoryUmbrellaVerdict.textContent = umb.verdict || "Not Needed";
  DOM.advisoryUmbrellaVerdict.className = `badge-suitability ${umb.needed ? 'suit-bad' : 'suit-good'}`;
  DOM.advisoryUmbrellaReason.textContent = umb.reason || "";
  DOM.advisoryUmbrellaWindow.textContent = umb.rain_window || "";

  const clo = impact.clothing || {};
  DOM.advisoryClothingLayers.textContent = clo.layers || "Comfortable";
  DOM.advisoryClothingSummary.textContent = clo.summary || "";
  DOM.advisoryClothingAccessories.textContent = (clo.accessories && clo.accessories.length) ? `Suggested: ${clo.accessories.join(', ')}` : "";

  const trv = impact.travel || {};
  DOM.advisoryTravelStatus.textContent = trv.status || "Smooth";
  DOM.advisoryTravelStatus.className = `badge-suitability ${trv.status === 'Smooth' ? 'suit-good' : 'suit-warn'}`;
  DOM.advisoryTravelRoad.textContent = `Road conditions: ${trv.road_condition || 'Normal'}`;
  DOM.advisoryTravelTip.textContent = trv.driving_tip || "";

  const hlt = impact.health || {};
  DOM.advisoryHydration.textContent = hlt.hydration || "";
  DOM.advisoryUV.textContent = hlt.uv_advice || "";

  const acts = impact.activities || {};
  if (acts.running) {
    DOM.gaugeRunningScore.textContent = `${acts.running.score}/100`;
    DOM.gaugeRunningStatus.textContent = acts.running.status;
  }
  if (acts.cycling) {
    DOM.gaugeCyclingScore.textContent = `${acts.cycling.score}/100`;
    DOM.gaugeCyclingStatus.textContent = acts.cycling.status;
  }
  if (acts.outdoor_dining) {
    DOM.gaugeDiningScore.textContent = `${acts.outdoor_dining.score}/100`;
    DOM.gaugeDiningStatus.textContent = acts.outdoor_dining.status;
  }
  if (acts.walking) {
    DOM.gaugeWalkingScore.textContent = `${acts.walking.score}/100`;
    DOM.gaugeWalkingStatus.textContent = acts.walking.status;
  }
}

function renderComparison(comp) {
  if (!comp) return;
  const isImp = state.units === "imperial";
  const d1 = comp.day1 || {};
  const d2 = comp.day2 || {};
  const deltas = comp.deltas || {};

  const d1Temp = isImp ? Math.round(d1.temp_max_f) : Math.round(d1.temp_max);
  const d2Temp = isImp ? Math.round(d2.temp_max_f) : Math.round(d2.temp_max);

  DOM.compDay1Temp.textContent = `${d1Temp}°`;
  DOM.compDay1Cond.textContent = d1.description || "Clear";
  DOM.compDay1Rain.textContent = `Rain: ${d1.precipitation_probability || 0}%`;

  DOM.compDay2Temp.textContent = `${d2Temp}°`;
  DOM.compDay2Cond.textContent = d2.description || "Clear";
  DOM.compDay2Rain.textContent = `Rain: ${d2.precipitation_probability || 0}%`;

  DOM.compDeltasSummary.textContent = `${deltas.temp_verdict || 'Similar temp'}, ${deltas.rain_verdict || 'similar rain'}`;
  DOM.compInsightText.textContent = comp.insight || "";
}

function renderAlertsTab(alerts) {
  DOM.alertsFullList.innerHTML = "";
  if (!alerts || !alerts.length) {
    DOM.alertsFullList.innerHTML = `<div style="font-size:0.9rem;color:var(--text-muted);padding:1rem 0;">No severe weather alerts at this time. Stable conditions expected.</div>`;
    return;
  }

  alerts.forEach(a => {
    const isWarn = a.severity === "warning";
    const item = document.createElement("div");
    item.className = "alert-banner-box";
    item.style.borderColor = isWarn ? "var(--color-error)" : "var(--color-primary)";
    item.style.background = isWarn ? "var(--color-error-container)" : "var(--bg-input)";

    item.innerHTML = `
      <div class="alert-icon-wrap" style="background:${isWarn ? 'var(--color-error)' : 'var(--color-primary)'};">
        <span class="material-symbols-outlined" style="font-size:20px;">${isWarn ? 'warning' : 'info'}</span>
      </div>
      <div class="alert-banner-content">
        <span class="alert-tag" style="background:${isWarn ? 'var(--color-error)' : 'var(--color-primary)'};">${a.severity.toUpperCase()}</span>
        <div class="alert-heading" style="color:${isWarn ? 'var(--color-on-error-container)' : 'var(--text-primary)'};">${a.title}</div>
        <p class="alert-desc" style="color:${isWarn ? 'var(--color-on-error-container)' : 'var(--text-secondary)'};">${a.message}</p>
        <span style="font-size:0.75rem;font-weight:700;margin-top:0.3rem;display:inline-block;">Window: ${a.time_window || 'Today'}</span>
      </div>
    `;
    DOM.alertsFullList.appendChild(item);
  });
}

// ==========================================
// 5. SEARCH & NATURAL QUERY RESOLVER
// ==========================================

let searchTimer = null;

function handleSearchInput(e) {
  const query = e.target.value.trim();
  clearTimeout(searchTimer);

  if (!query || query.length < 2) {
    DOM.searchDropdown.style.display = "none";
    return;
  }

  searchTimer = setTimeout(async () => {
    try {
      // Direct geocode query
      const geo = await apiRequest("/geocode", { name: query });
      renderSearchDropdown(geo.results || []);
    } catch (err) {
      DOM.searchDropdown.style.display = "none";
    }
  }, 300);
}

function renderSearchDropdown(results) {
  DOM.searchDropdown.innerHTML = "";
  if (!results.length) {
    DOM.searchDropdown.style.display = "none";
    return;
  }

  results.slice(0, 5).forEach(r => {
    const item = document.createElement("div");
    item.className = "search-dropdown-item";
    item.style.padding = "0.6rem 0.85rem";
    item.style.cursor = "pointer";
    item.style.borderBottom = "1px solid var(--border-subtle)";
    item.innerHTML = `
      <div style="font-weight:600;font-size:0.85rem;">${r.name}</div>
      <div style="font-size:0.72rem;color:var(--text-muted);">${[r.admin1, r.country].filter(Boolean).join(", ")}</div>
    `;
    item.addEventListener("click", () => {
      state.location = {
        name: r.name,
        country: r.country || "",
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone || "auto"
      };
      DOM.searchInput.value = "";
      DOM.searchDropdown.style.display = "none";
      loadCompleteWeatherData();
    });
    DOM.searchDropdown.appendChild(item);
  });

  DOM.searchDropdown.style.display = "block";
}

async function handleSearchSubmit() {
  const query = DOM.searchInput.value.trim();
  if (!query) return;

  DOM.searchDropdown.style.display = "none";

  // Check if it's a natural question in any language
  try {
    const nlpRes = await apiRequest("/weather/natural-search", {
      query: query,
      units: state.units,
      language: state.lang
    });

    if (nlpRes.type === "comparison") {
      switchTab("comparison");
      // Execute city comparison
      DOM.city2Input.value = nlpRes.city2 || "";
      runCityComparison(nlpRes.city1, nlpRes.city2);
      return;
    }

    if (nlpRes.location && nlpRes.location.name) {
      state.location = {
        name: nlpRes.location.name,
        country: nlpRes.location.country || "",
        latitude: nlpRes.location.latitude,
        longitude: nlpRes.location.longitude,
        timezone: nlpRes.location.timezone || "auto"
      };
      await loadCompleteWeatherData();

      // If user asked a specific conversational question, pass it to chat
      if (query.length > 15 || query.includes("?") || query.includes("rain") || query.includes("weather") || query.includes("क्या") || query.includes("ਕੀ")) {
        switchTab("assistant");
        if (chatController) {
          chatController.sendMessage(query);
        }
      }
    }
  } catch (err) {
    console.warn("Natural query parse error, falling back to geocode:", err);
    try {
      const geo = await apiRequest("/geocode", { name: query });
      if (geo.results && geo.results.length > 0) {
        const top = geo.results[0];
        state.location = {
          name: top.name,
          country: top.country || "",
          latitude: top.latitude,
          longitude: top.longitude,
          timezone: top.timezone || "auto"
        };
        loadCompleteWeatherData();
      }
    } catch (e) {
      showError(true, "Could not find location.");
    }
  }
}

// ==========================================
// 6. CITY COMPARISON HUB
// ==========================================

async function runCityComparison(city1Override, city2Override) {
  const c1 = city1Override || state.location.name;
  const c2 = city2Override || (DOM.city2Input ? DOM.city2Input.value.trim() : "");

  if (!c2) {
    if (DOM.cityCompareOutput) {
      DOM.cityCompareOutput.innerHTML = `<span style="color:var(--color-error)">Please enter a second city name.</span>`;
    }
    return;
  }

  DOM.cityCompareOutput.innerHTML = `<span style="color:var(--text-muted)">Comparing ${c1} and ${c2}...</span>`;

  try {
    const comp = await apiRequest("/weather/compare", {
      mode: "cities",
      location_name: c1,
      location2_name: c2,
      units: state.units,
      language: state.lang
    });

    renderCityComparisonResult(comp);
  } catch (err) {
    DOM.cityCompareOutput.innerHTML = `<span style="color:var(--color-error)">Comparison failed: ${err.message || 'Location not found'}</span>`;
  }
}

function renderCityComparisonResult(comp) {
  const l1 = comp.location1 || {};
  const l2 = comp.location2 || {};
  const isImp = state.units === "imperial";

  const t1 = isImp && l1.temperature_f !== undefined ? Math.round(l1.temperature_f) : Math.round(l1.temperature);
  const t2 = isImp && l2.temperature_f !== undefined ? Math.round(l2.temperature_f) : Math.round(l2.temperature);

  DOM.cityCompareOutput.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
      <div class="meteo-box">
        <strong style="font-size:0.9rem;">${l1.name}</strong>
        <div style="font-size:1.4rem;font-weight:800;color:var(--color-primary);">${t1}°</div>
        <div style="font-size:0.8rem;">${l1.weather_description || 'Clear'}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">Humidity: ${l1.humidity}%</div>
      </div>
      <div class="meteo-box">
        <strong style="font-size:0.9rem;">${l2.name}</strong>
        <div style="font-size:1.4rem;font-weight:800;color:var(--color-primary);">${t2}°</div>
        <div style="font-size:0.8rem;">${l2.weather_description || 'Clear'}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">Humidity: ${l2.humidity}%</div>
      </div>
    </div>
    <div class="ai-insight-box">
      <div style="font-weight:700;font-size:0.85rem;">Comparative Analysis</div>
      <p style="font-size:0.82rem;line-height:1.4;">${comp.insight}</p>
    </div>
  `;
}

// ==========================================
// 7. SETTINGS & CONTROLS
// ==========================================

function updateSettingsControls() {
  if (DOM.tempUnitGroup) {
    DOM.tempUnitGroup.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-unit") === state.units);
    });
  }
  if (DOM.themeGroup) {
    DOM.themeGroup.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === state.theme);
    });
  }
  if (DOM.languageGridSelector) {
    DOM.languageGridSelector.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    });
  }
  if (DOM.speechToggle) {
    DOM.speechToggle.checked = state.speechEnabled;
  }
}

// ==========================================
// 8. EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  // Navigation Tabs
  DOM.navTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    });
  });

  // Header Location Button -> Focus search
  if (DOM.locationPickerBtn) {
    DOM.locationPickerBtn.addEventListener("click", () => {
      DOM.searchInput.focus();
      DOM.searchInput.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Search Input Events
  DOM.searchInput.addEventListener("input", handleSearchInput);
  DOM.searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearchSubmit();
    if (e.key === "Escape") DOM.searchDropdown.style.display = "none";
  });

  // Language Modal Open & Close
  if (DOM.langSelectorBtn) {
    DOM.langSelectorBtn.addEventListener("click", () => {
      DOM.languageModal.style.display = "flex";
    });
  }
  if (DOM.closeLangModalBtn) {
    DOM.closeLangModalBtn.addEventListener("click", () => {
      DOM.languageModal.style.display = "none";
    });
  }

  // Language Modal Selection Grid
  if (DOM.modalLangGrid) {
    DOM.modalLangGrid.addEventListener("click", e => {
      const card = e.target.closest(".lang-grid-card");
      if (card) {
        const lang = card.getAttribute("data-lang");
        if (lang) {
          applyLanguage(lang, false);
          DOM.languageModal.style.display = "none";
        }
      }
    });
  }

  // Settings Tab Language Selection Grid
  if (DOM.languageGridSelector) {
    DOM.languageGridSelector.addEventListener("click", e => {
      const card = e.target.closest(".lang-grid-card");
      if (card) {
        const lang = card.getAttribute("data-lang");
        if (lang) {
          applyLanguage(lang, false);
        }
      }
    });
  }

  // Theme Toggle Header
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("weathergpt_theme", state.theme);
      document.documentElement.setAttribute("data-theme", state.theme);
      updateThemeIcon();
      updateSettingsControls();
    });
  }

  // Voice Readout Trigger in Header
  if (DOM.voiceTriggerBtn) {
    DOM.voiceTriggerBtn.addEventListener("click", () => {
      const text = DOM.explainText ? DOM.explainText.textContent : "";
      if (voiceManager) {
        const speaking = typeof voiceManager.isSpeaking === "function" ? voiceManager.isSpeaking() : Boolean(voiceManager.isSpeaking);
        if (speaking) {
          if (typeof voiceManager.stopSpeaking === "function") {
            voiceManager.stopSpeaking();
          } else if (typeof voiceManager.stop === "function") {
            voiceManager.stop();
          }
        } else {
          voiceManager.speak(text, state.lang);
        }
      }
    });
  }

  // Re-Explain Button
  if (DOM.reExplainBtn) {
    DOM.reExplainBtn.addEventListener("click", async () => {
      DOM.explainText.textContent = I18n.t("ai_insight_loading", state.lang) || "Generating real-time AI weather reasoning...";
      try {
        const res = await apiRequest("/weather/explain", {
          latitude: state.location.latitude,
          longitude: state.location.longitude,
          location_name: state.location.name,
          units: state.units,
          language: state.lang
        });
        renderExplain(res.explanation);
      } catch (err) {
        renderExplain("Unable to refresh explanation.");
      }
    });
  }

  // Quick Questions Chips
  if (DOM.quickQuestionsChips) {
    DOM.quickQuestionsChips.addEventListener("click", e => {
      const chip = e.target.closest(".quick-action-chip");
      if (chip) {
        const text = chip.querySelector(".chip-text") ? chip.querySelector(".chip-text").textContent.trim() : chip.textContent.trim();
        switchTab("assistant");
        if (chatController) {
          chatController.sendMessage(text);
        }
      }
    });
  }

  // Alert Banner Modal Triggers
  if (DOM.openAlertModalBtn) {
    DOM.openAlertModalBtn.addEventListener("click", openAlertModal);
  }
  if (DOM.dismissAlertBtn) {
    DOM.dismissAlertBtn.addEventListener("click", () => {
      DOM.alertBannerBox.style.display = "none";
    });
  }
  if (DOM.closeAlertModalBtn) DOM.closeAlertModalBtn.addEventListener("click", closeAlertModal);
  if (DOM.modalAcknowledgeBtn) DOM.modalAcknowledgeBtn.addEventListener("click", closeAlertModal);

  // Comparison Tabs
  if (DOM.compareTabDaysBtn) {
    DOM.compareTabDaysBtn.addEventListener("click", () => {
      DOM.compareTabDaysBtn.style.background = "var(--color-primary-container)";
      DOM.compareTabDaysBtn.style.color = "#ffffff";
      DOM.compareTabCitiesBtn.style.background = "var(--bg-card)";
      DOM.compareTabCitiesBtn.style.color = "var(--color-primary)";
      DOM.compareDaysView.style.display = "block";
      DOM.compareCitiesView.style.display = "none";
    });
  }
  if (DOM.compareTabCitiesBtn) {
    DOM.compareTabCitiesBtn.addEventListener("click", () => {
      DOM.compareTabCitiesBtn.style.background = "var(--color-primary-container)";
      DOM.compareTabCitiesBtn.style.color = "#ffffff";
      DOM.compareTabDaysBtn.style.background = "var(--bg-card)";
      DOM.compareTabDaysBtn.style.color = "var(--color-primary)";
      DOM.compareDaysView.style.display = "none";
      DOM.compareCitiesView.style.display = "block";
    });
  }
  if (DOM.runCityCompareBtn) DOM.runCityCompareBtn.addEventListener("click", () => runCityComparison());
  if (DOM.city2Input) {
    DOM.city2Input.addEventListener("keydown", e => {
      if (e.key === "Enter") runCityComparison();
    });
  }

  // Settings Controls
  if (DOM.tempUnitGroup) {
    DOM.tempUnitGroup.addEventListener("click", e => {
      const btn = e.target.closest(".settings-opt-btn");
      if (btn) {
        state.units = btn.getAttribute("data-unit");
        localStorage.setItem("weathergpt_units", state.units);
        updateSettingsControls();
        loadCompleteWeatherData();
      }
    });
  }

  if (DOM.themeGroup) {
    DOM.themeGroup.addEventListener("click", e => {
      const btn = e.target.closest(".settings-opt-btn");
      if (btn) {
        state.theme = btn.getAttribute("data-theme-val");
        localStorage.setItem("weathergpt_theme", state.theme);
        document.documentElement.setAttribute("data-theme", state.theme);
        updateThemeIcon();
        updateSettingsControls();
      }
    });
  }

  if (DOM.speechToggle) {
    DOM.speechToggle.addEventListener("change", e => {
      state.speechEnabled = e.target.checked;
      localStorage.setItem("weathergpt_speech", state.speechEnabled);
    });
  }

  // Close modals and dropdowns on backdrop click
  document.addEventListener("click", e => {
    if (DOM.searchInput && DOM.searchDropdown && !DOM.searchInput.contains(e.target) && !DOM.searchDropdown.contains(e.target)) {
      DOM.searchDropdown.style.display = "none";
    }
    if (e.target === DOM.languageModal) {
      DOM.languageModal.style.display = "none";
    }
    if (e.target === DOM.alertDetailModal) {
      DOM.alertDetailModal.style.display = "none";
    }
  });

  if (DOM.errorRetryBtn) DOM.errorRetryBtn.addEventListener("click", loadCompleteWeatherData);
}

function openAlertModal() {
  const alerts = state.currentAlerts;
  if (!alerts.length) return;

  const topAlert = alerts[0];
  DOM.modalAlertTitle.textContent = topAlert.title;
  DOM.modalAlertContent.innerHTML = `
    <div style="background:var(--color-error-container);color:var(--color-on-error-container);padding:0.85rem;border-radius:var(--radius-md);margin-bottom:0.85rem;">
      <strong>${I18n.t("hazard_level", state.lang) || "Hazard Level"}: ${topAlert.severity.toUpperCase()}</strong>
      <p style="margin-top:0.25rem;">${topAlert.message}</p>
    </div>
    <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      <strong>${I18n.t("valid_window", state.lang) || "Valid Window"}:</strong> ${topAlert.time_window || 'Next 24 hours'}<br>
      <strong>Authority / Source:</strong> Open-Meteo Verified Forecast & WeatherGPT Rule Engine
    </div>
    <h4 style="font-weight:700;margin-bottom:0.35rem;">Safety Precautions & Guidelines:</h4>
    <ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:0.3rem;">
      <li>Avoid open fields, tall trees, and water bodies during high wind and lightning.</li>
      <li>Secure outdoor equipment, crops, and loose furniture.</li>
      <li>Keep an emergency power bank, torch, and clean drinking water accessible.</li>
      <li>Follow local civil authority updates for emergency announcements.</li>
    </ul>
  `;
  DOM.alertDetailModal.style.display = "flex";
}

function closeAlertModal() {
  DOM.alertDetailModal.style.display = "none";
}

function updateSyncStatus(text) {
  if (DOM.syncStatusText) DOM.syncStatusText.textContent = text;
}

function showError(show, msg = "") {
  DOM.errorBanner.style.display = show ? "flex" : "none";
  if (show && msg) DOM.errorMessage.textContent = msg;
}

// Start application
document.addEventListener("DOMContentLoaded", initApp);
