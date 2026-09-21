/**
 * WeatherGPT Voice Intelligence Engine
 * Handles Speech-to-Text (Voice Input) and Text-to-Speech (Voice Output)
 * Supports dynamic locale switching across 11 languages with graceful fallback.
 */

class VoiceManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentRecognitionLang = "en-IN";
    this.availableVoices = [];
    this.activeUtterance = null;
    this.currentSpeakingText = null;

    // Listeners and state callbacks
    this.onRecognitionStateChange = null; // (state: 'idle' | 'listening' | 'processing' | 'error', details) => {}
    this.onRecognitionResult = null;      // (transcript, isFinal) => {}
    this.onRecognitionError = null;       // (errorMessage) => {}
    this.onSpeechStateChange = null;       // (state: 'speaking' | 'paused' | 'stopped', details) => {}

    this.initRecognition();
    this.initSynthesis();
  }

  // ==========================================
  // 1. SPEECH RECOGNITION (VOICE INPUT)
  // ==========================================

  isRecognitionSupported() {
    return typeof window !== "undefined" && (
      "SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window ||
      "mozSpeechRecognition" in window ||
      "msSpeechRecognition" in window
    );
  }

  initRecognition() {
    if (!this.isRecognitionSupported()) return;

    const SpeechRec = window.SpeechRecognition ||
                      window.webkitSpeechRecognition ||
                      window.mozSpeechRecognition ||
                      window.msSpeechRecognition;

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onRecognitionStateChange) {
          this.onRecognitionStateChange("listening", { lang: this.currentRecognitionLang });
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);

        if (this.onRecognitionResult && transcript) {
          this.onRecognitionResult(transcript, isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        let msg = "Microphone error";
        if (event.error === "not-allowed") {
          msg = "Microphone permission denied. Please allow microphone access in your browser settings.";
        } else if (event.error === "no-speech") {
          msg = "No speech detected. Please try speaking again.";
        } else if (event.error === "network") {
          msg = "Speech network connection error.";
        }

        if (this.onRecognitionStateChange) {
          this.onRecognitionStateChange("error", { error: event.error, message: msg });
        }
        if (this.onRecognitionError) {
          this.onRecognitionError(msg);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onRecognitionStateChange) {
          this.onRecognitionStateChange("idle");
        }
      };

    } catch (e) {
      console.warn("Failed to initialize SpeechRecognition:", e);
      this.recognition = null;
    }
  }

  setLanguage(langCode = "en-IN") {
    const norm = typeof I18n !== "undefined" && I18n.normalizeLang ? I18n.normalizeLang(langCode) : langCode;
    const languages = (typeof window !== "undefined" && window.LANGUAGES) || (typeof LANGUAGES !== "undefined" ? LANGUAGES : (typeof I18n !== "undefined" ? (I18n.LANGUAGES || I18n.languages) : {}));
    const config = (languages && languages[norm]) || (languages && languages["en-IN"]) || {};
    this.currentRecognitionLang = config.speechRecognition || norm || "en-IN";
    if (this.recognition) {
      try {
        this.recognition.lang = this.currentRecognitionLang;
      } catch (e) {
        // ignore
      }
    }
    return this.currentRecognitionLang;
  }

  startListening(langCode = "en-IN") {
    if (!this.isRecognitionSupported() || !this.recognition) {
      if (this.onRecognitionError) {
        this.onRecognitionError("Voice input is not supported in this browser.");
      }
      return false;
    }

    // Map language code to speech recognition locale
    const norm = typeof I18n !== "undefined" && I18n.normalizeLang ? I18n.normalizeLang(langCode) : langCode;
    const languages = (typeof window !== "undefined" && window.LANGUAGES) || (typeof LANGUAGES !== "undefined" ? LANGUAGES : (typeof I18n !== "undefined" ? (I18n.LANGUAGES || I18n.languages) : {}));
    const config = (languages && languages[norm]) || (languages && languages["en-IN"]) || {};
    this.currentRecognitionLang = config.speechRecognition || norm || "en-IN";

    try {
      this.recognition.lang = this.currentRecognitionLang;
      this.recognition.start();
      return true;
    } catch (err) {
      // If already started, stop and restart
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition.lang = this.currentRecognitionLang;
          this.recognition.start();
        }, 150);
        return true;
      } catch (e) {
        console.warn("Could not start recognition:", e);
        return false;
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  toggleListening(langCode = "en-IN") {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening(langCode);
    }
  }

  // ==========================================
  // 2. SPEECH SYNTHESIS (VOICE OUTPUT)
  // ==========================================

  isSynthesisSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  initSynthesis() {
    if (!this.isSynthesisSupported()) return;

    const loadVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices() || [];
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getBestVoiceForLocale(locale) {
    if (!this.availableVoices || !this.availableVoices.length) {
      this.availableVoices = window.speechSynthesis.getVoices() || [];
    }

    const cleanLocale = locale.toLowerCase().replace("_", "-");
    const langPrefix = cleanLocale.split("-")[0];

    // 1. Exact locale match (e.g. 'te-IN')
    let match = this.availableVoices.find(v => v.lang.toLowerCase().replace("_", "-") === cleanLocale);
    if (match) return match;

    // 2. Language prefix match (e.g. 'te')
    match = this.availableVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (match) return match;

    // 3. Fallback: default voice
    return this.availableVoices.find(v => v.default) || this.availableVoices[0] || null;
  }

  hasVoiceForLocale(locale) {
    if (!this.availableVoices || !this.availableVoices.length) {
      this.availableVoices = window.speechSynthesis.getVoices() || [];
    }
    const cleanLocale = locale.toLowerCase().replace("_", "-");
    const langPrefix = cleanLocale.split("-")[0];
    return this.availableVoices.some(v => v.lang.toLowerCase().replace("_", "-") === cleanLocale || v.lang.toLowerCase().startsWith(langPrefix));
  }

  speak(text, langCode = "en-IN", onEndCallback = null) {
    if (!this.isSynthesisSupported()) return false;
    if (!text || !text.trim()) return false;

    window.speechSynthesis.cancel();

    const norm = typeof I18n !== "undefined" && I18n.normalizeLang ? I18n.normalizeLang(langCode) : langCode;
    const languages = (typeof window !== "undefined" && window.LANGUAGES) || (typeof LANGUAGES !== "undefined" ? LANGUAGES : (typeof I18n !== "undefined" ? (I18n.LANGUAGES || I18n.languages) : {}));
    const config = (languages && languages[norm]) || (languages && languages["en-IN"]) || {};
    const targetLocale = config.speechSynthesis || norm || "en-IN";


    // Check if voice exists for this language
    const voice = this.getBestVoiceForLocale(targetLocale);
    const hasVoice = this.hasVoiceForLocale(targetLocale);

    // Strip Markdown & special formatting symbols for clean speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/•/g, ', ')
      .replace(/#/g, '')
      .replace(/[—–]/g, ', ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLocale;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95; // slightly relaxed natural pace
    utterance.pitch = 1.0;

    this.activeUtterance = utterance;
    this.currentSpeakingText = cleanText;

    utterance.onstart = () => {
      if (this.onSpeechStateChange) {
        this.onSpeechStateChange("speaking", { text: cleanText, lang: norm, hasExactVoice: hasVoice });
      }
    };

    utterance.onpause = () => {
      if (this.onSpeechStateChange) this.onSpeechStateChange("paused");
    };

    utterance.onresume = () => {
      if (this.onSpeechStateChange) this.onSpeechStateChange("speaking");
    };

    utterance.onend = () => {
      this.activeUtterance = null;
      this.currentSpeakingText = null;
      if (this.onSpeechStateChange) this.onSpeechStateChange("stopped");
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      this.activeUtterance = null;
      this.currentSpeakingText = null;
      if (this.onSpeechStateChange) this.onSpeechStateChange("stopped");
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  pause() {
    if (this.isSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      if (this.onSpeechStateChange) this.onSpeechStateChange("paused");
    }
  }

  resume() {
    if (this.isSynthesisSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      if (this.onSpeechStateChange) this.onSpeechStateChange("speaking");
    }
  }

  stop() {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
      this.currentSpeakingText = null;
      if (this.onSpeechStateChange) this.onSpeechStateChange("stopped");
    }
  }

  stopSpeaking() {
    this.stop();
  }

  isSpeaking() {
    return Boolean(this.isSynthesisSupported() && window.speechSynthesis.speaking && !window.speechSynthesis.paused);
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.VoiceManager = VoiceManager;
}
