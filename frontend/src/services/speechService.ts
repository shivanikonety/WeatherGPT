// frontend/src/services/speechService.ts

type SpeechCallbacks = {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
};

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private retryCount = 0;

  // Strict Indian language mapping
  private readonly LANG_MAP: Record<string, string> = {
    hi: "hi-IN",
    en: "en-IN",
    ta: "ta-IN",
    te: "te-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    pa: "pa-IN",
    or: "or-IN",
    as: "as-IN",
    ur: "ur-PK", // ur-IN is less supported, ur-PK works better
    auto: "hi-IN",
  };

  private getLocale(lang: string): string {
    return this.LANG_MAP[lang] || "hi-IN";
  }

  // ====================== SPEECH TO TEXT ======================
  startListening(lang: string = "hi", callbacks: SpeechCallbacks = {}) {
    // Always stop previous instance first
    this.stopListening();

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onError?.("Speech Recognition not supported. Please use Google Chrome.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.getLocale(lang);
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log("%c Listening started in " + this.getLocale(lang), "color: lime");
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        console.log("Final:", finalTranscript);
        callbacks.onResult?.(finalTranscript.trim(), true);
      } else if (interim) {
        callbacks.onResult?.(interim.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      console.error("Speech Error:", event.error);

      if (event.error === "no-speech") {
        callbacks.onError?.(
          "आवाज़ नहीं सुनाई दी। कृपया माइक के पास आकर साफ़ बोलें।\n(No speech detected)"
        );
      } else if (event.error === "not-allowed") {
        callbacks.onError?.("माइक्रोफोन की अनुमति नहीं मिली। Allow करें।");
      } else if (event.error === "aborted") {
        // Ignore aborted (happens when we manually stop)
        return;
      } else {
        callbacks.onError?.(`Voice Error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      callbacks.onError?.("माइक्रोफोन शुरू नहीं हो पाया");
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        // Remove event handlers to prevent loop
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.onresult = null;
        this.recognition.stop();
      } catch (e) { }
      this.recognition = null;
    }
    this.isListening = false;
  }
  // ====================== TEXT TO SPEECH ======================
  speak(text: string, lang: string = "hi", rate: number = 0.95, onEnd?: () => void) {
    if (!window.speechSynthesis) return;

    this.cancelSpeak();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = this.getLocale(lang);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Force best Indian voice
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = this.findBestVoice(voices, lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log("Using voice:", bestVoice.name, bestVoice.lang);
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  cancelSpeak() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private findBestVoice(voices: SpeechSynthesisVoice[], lang: string) {
    const locale = this.getLocale(lang);
    const langCode = locale.split("-")[0];

    // Priority order
    return (
      voices.find((v) => v.lang === locale && v.name.toLowerCase().includes("india")) ||
      voices.find((v) => v.lang === locale) ||
      voices.find((v) => v.lang.startsWith(langCode) && v.name.toLowerCase().includes("india")) ||
      voices.find((v) => v.lang.startsWith(langCode)) ||
      null
    );
  }
}

export const speechService = new SpeechService();