/**
 * WeatherGPT ChatGPT-Style Conversational Chat Engine
 * Provides persistent multi-turn conversational chat, action controls (Copy, Speak, Regenerate),
 * auto-expanding multiline input, typing animations, intelligent auto-scrolling, and speech integration.
 */

class ChatController {
  constructor(options = {}) {
    this.messagesContainer = options.messagesContainer || options.container || document.getElementById("chatMessagesArea");
    this.chatInput = options.chatInput || options.input || document.getElementById("chatInput");
    this.sendBtn = options.sendBtn || document.getElementById("chatSendBtn");
    this.clearBtn = options.clearBtn || options.clearChatBtn || document.getElementById("clearChatBtn");
    this.newChatBtn = options.newChatBtn || document.getElementById("newChatBtn");
    this.micBtn = options.micBtn || options.chatMicBtn || document.getElementById("chatMicBtn");

    this.voice = options.voiceManager || (typeof window !== "undefined" && window.voiceManager) || (typeof VoiceManager !== "undefined" ? new VoiceManager() : null);
    this.apiClient = options.apiClient || (async (endpoint, payload) => (typeof window !== "undefined" && window.apiRequest ? window.apiRequest(endpoint, payload) : null));
    this.onSendCallback = options.onSend || null;
    this.getLocation = options.getLocation || (() => (typeof window !== "undefined" && window.state ? window.state.location : { name: "New York", latitude: 40.7128, longitude: -74.0060 }));
    this.getUnits = options.getUnits || (() => (typeof window !== "undefined" && window.state ? window.state.units : "metric"));
    this.getLang = options.getLang || (() => (typeof window !== "undefined" && window.state ? window.state.lang : "en-IN"));

    this.conversationId = localStorage.getItem("weathergpt_conv_id") || this.generateConversationId();
    this.history = this.loadHistory();
    this.isGenerating = false;
    this.currentSpeakingIndex = null;
    this.userScrolledUp = false;

    this.init();
  }

  render() {
    this.renderHistory();
  }

  generateConversationId() {
    const id = "conv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("weathergpt_conv_id", id);
    return id;
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem("weathergpt_chat_history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load chat history:", e);
    }
    return [];
  }

  saveHistory() {
    try {
      localStorage.setItem("weathergpt_chat_history", JSON.stringify(this.history));
    } catch (e) {
      console.warn("Failed to save chat history:", e);
    }
  }

  init() {
    this.setupEventListeners();
    this.renderHistory();
    this.setupVoiceCallbacks();
  }

  setupEventListeners() {
    // Scroll listener to detect if user manually scrolled up
    if (this.messagesContainer) {
      this.messagesContainer.addEventListener("scroll", () => {
        const threshold = 100;
        const distanceFromBottom = this.messagesContainer.scrollHeight - this.messagesContainer.scrollTop - this.messagesContainer.clientHeight;
        this.userScrolledUp = distanceFromBottom > threshold;
      });
    }

    // Multiline Textarea handling (Enter sends, Shift+Enter newline, auto-grow)
    if (this.chatInput) {
      this.chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });

      this.chatInput.addEventListener("input", () => {
        this.resizeTextarea();
      });

      // Handle paste
      this.chatInput.addEventListener("paste", () => {
        setTimeout(() => this.resizeTextarea(), 10);
      });
    }

    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.handleSendMessage());
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => this.clearChat());
    }

    if (this.newChatBtn) {
      this.newChatBtn.addEventListener("click", () => this.startNewChat());
    }

    // Microphone button handling
    if (this.micBtn) {
      this.micBtn.addEventListener("click", () => {
        const lang = this.getLang();
        if (this.voice) {
          this.voice.toggleListening(lang);
        }
      });
    }
  }

  resizeTextarea() {
    if (!this.chatInput || this.chatInput.tagName.toLowerCase() !== "textarea") return;
    this.chatInput.style.height = "auto";
    const newHeight = Math.min(this.chatInput.scrollHeight, 160);
    this.chatInput.style.height = (newHeight > 24 ? newHeight : 24) + "px";
  }

  resetTextarea() {
    if (!this.chatInput) return;
    this.chatInput.value = "";
    if (this.chatInput.tagName.toLowerCase() === "textarea") {
      this.chatInput.style.height = "auto";
    }
  }

  setupVoiceCallbacks() {
    if (!this.voice) return;

    this.voice.onRecognitionStateChange = (state, details) => {
      if (this.micBtn) {
        this.micBtn.classList.toggle("listening", state === "listening");
        this.micBtn.classList.toggle("processing", state === "processing");
        this.micBtn.classList.toggle("error", state === "error");

        const iconEl = this.micBtn.querySelector(".material-symbols-outlined");
        if (iconEl) {
          if (state === "listening") {
            iconEl.textContent = "mic_noise";
          } else if (state === "processing") {
            iconEl.textContent = "hourglass_empty";
          } else {
            iconEl.textContent = "mic";
          }
        }

        const lang = this.getLang();
        const tooltip = state === "listening" ? I18n.t("micListening", lang) : I18n.t("micIdle", lang);
        this.micBtn.setAttribute("title", tooltip);
      }
    };

    this.voice.onRecognitionResult = (transcript, isFinal) => {
      if (this.chatInput) {
        this.chatInput.value = transcript;
        this.resizeTextarea();
        if (isFinal) {
          this.chatInput.focus();
        }
      }
    };

    this.voice.onSpeechStateChange = (state, details) => {
      // Update speaking icon states across assistant messages
      document.querySelectorAll(".btn-speak-msg").forEach((btn) => {
        const iconEl = btn.querySelector(".material-symbols-outlined");
        const isTarget = btn.getAttribute("data-msg-idx") === String(this.currentSpeakingIndex);
        if (iconEl) {
          if (state === "speaking" && isTarget) {
            iconEl.textContent = "stop_circle";
            btn.classList.add("is-speaking");
          } else {
            iconEl.textContent = "volume_up";
            btn.classList.remove("is-speaking");
          }
        }
      });
    };
  }

  renderHistory() {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = "";

    const lang = this.getLang();

    if (!this.history.length) {
      this.renderWelcomeHero(lang);
      return;
    }

    this.history.forEach((msg, idx) => {
      if (msg.role === "user") {
        this.renderUserMessage(msg.content, msg.timestamp);
      } else {
        this.renderAssistantMessage(msg.content, msg.timestamp, idx);
      }
    });

    this.scrollToBottom(true);
  }

  renderWelcomeHero(lang) {
    const heroDiv = document.createElement("div");
    heroDiv.className = "chat-welcome-hero";

    const title = I18n.t("chatAssistantTitle", lang) || "WeatherGPT Assistant";
    const welcome = I18n.t("chatWelcome", lang) || "Hello! Ask me anything about the weather, what to wear, outdoor plans, rain timings, or comparative differences.";
    const starterChips = [
      { key: "umbrella", icon: "umbrella", text: I18n.t("chipUmbrella", lang) || "Will I need an umbrella?" },
      { key: "clothing", icon: "checkroom", text: I18n.t("chipClothing", lang) || "What should I wear today?" },
      { key: "rain", icon: "rainy", text: I18n.t("chipRain", lang) || "Is rain expected today?" },
      { key: "temp", icon: "thermostat", text: I18n.t("chipTemp", lang) || "How hot will it feel?" }
    ];

    heroDiv.innerHTML = `
      <div class="chat-welcome-icon-wrap">
        <span class="material-symbols-outlined" style="font-size:32px;">psychiatry</span>
      </div>
      <h3 class="chat-welcome-title">${title}</h3>
      <p class="chat-welcome-desc">${welcome}</p>
      <div class="chat-starter-chips">
        ${starterChips.map(c => `
          <button class="chat-starter-chip" data-prompt="${this.escapeHtml(c.text)}">
            <span class="material-symbols-outlined" style="font-size:16px;">${c.icon}</span>
            <span>${c.text}</span>
          </button>
        `).join("")}
      </div>
    `;

    // Bind starter chips click
    heroDiv.querySelectorAll(".chat-starter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const promptText = chip.getAttribute("data-prompt");
        if (promptText) {
          this.sendMessage(promptText);
        }
      });
    });

    this.messagesContainer.appendChild(heroDiv);
  }

  renderUserMessage(text, timestamp) {
    const timeStr = timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const row = document.createElement("div");
    row.className = "chat-msg-row user";

    row.innerHTML = `
      <div class="chat-msg-body">
        <div class="chat-bubble user">
          <div class="user-msg-text">${this.escapeHtml(text)}</div>
        </div>
        <div class="chat-msg-time">${timeStr}</div>
      </div>
    `;

    this.messagesContainer.appendChild(row);
    this.scrollToBottom(true);
  }

  renderAssistantMessage(content, timestamp, msgIndex) {
    const timeStr = timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const row = document.createElement("div");
    row.className = "chat-msg-row assistant";
    row.setAttribute("data-msg-idx", msgIndex);

    const lang = this.getLang();
    const formatted = this.formatMarkdown(content);

    row.innerHTML = `
      <div class="chat-avatar assistant" title="${I18n.t("chatAssistantTitle", lang) || "WeatherGPT"}">
        <span class="material-symbols-outlined" style="font-size:18px;">psychiatry</span>
      </div>
      <div class="chat-msg-body">
        <div class="chat-bubble assistant">
          <div class="chat-markdown">${formatted}</div>
        </div>
        <div class="chat-action-bar">
          <button class="msg-action-btn btn-copy-msg" title="${I18n.t("copy", lang) || "Copy"}" aria-label="Copy response">
            <span class="material-symbols-outlined" style="font-size:15px;">content_copy</span>
            <span class="btn-text">${I18n.t("copy", lang) || "Copy"}</span>
          </button>
          <button class="msg-action-btn btn-speak-msg" data-msg-idx="${msgIndex}" title="${I18n.t("speak", lang) || "Read aloud"}" aria-label="Read aloud">
            <span class="material-symbols-outlined" style="font-size:15px;">volume_up</span>
            <span class="btn-text">${I18n.t("speak", lang) || "Speak"}</span>
          </button>
          <button class="msg-action-btn btn-regen-msg" data-msg-idx="${msgIndex}" title="${I18n.t("regenerate", lang) || "Regenerate"}" aria-label="Regenerate response">
            <span class="material-symbols-outlined" style="font-size:15px;">refresh</span>
            <span class="btn-text">${I18n.t("regenerate", lang) || "Regenerate"}</span>
          </button>
          <span class="chat-msg-time" style="margin-left:auto;">${timeStr}</span>
        </div>
      </div>
    `;

    // Event listener: Copy
    const copyBtn = row.querySelector(".btn-copy-msg");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(content).then(() => {
          const textSpan = copyBtn.querySelector(".btn-text");
          const iconSpan = copyBtn.querySelector(".material-symbols-outlined");
          if (textSpan) textSpan.textContent = I18n.t("copied", lang) || "Copied!";
          if (iconSpan) iconSpan.textContent = "check";
          setTimeout(() => {
            if (textSpan) textSpan.textContent = I18n.t("copy", lang) || "Copy";
            if (iconSpan) iconSpan.textContent = "content_copy";
          }, 2000);
        });
      });
    }

    // Event listener: Speak
    const speakBtn = row.querySelector(".btn-speak-msg");
    if (speakBtn) {
      speakBtn.addEventListener("click", () => {
        if (!this.voice) return;
        const isSpeaking = typeof this.voice.isSpeaking === "function" ? this.voice.isSpeaking() : Boolean(this.voice.isSpeaking);
        if (isSpeaking && this.currentSpeakingIndex === msgIndex) {
          if (typeof this.voice.stopSpeaking === "function") {
            this.voice.stopSpeaking();
          } else if (typeof this.voice.stop === "function") {
            this.voice.stop();
          }
          this.currentSpeakingIndex = null;
        } else {
          this.currentSpeakingIndex = msgIndex;
          this.voice.speak(content, lang, () => {
            this.currentSpeakingIndex = null;
          });
        }
      });
    }

    // Event listener: Regenerate
    const regenBtn = row.querySelector(".btn-regen-msg");
    if (regenBtn) {
      regenBtn.addEventListener("click", () => {
        if (this.isGenerating) return;
        // Find previous user query
        let lastUserMsg = "";
        for (let i = msgIndex - 1; i >= 0; i--) {
          if (this.history[i] && this.history[i].role === "user") {
            lastUserMsg = this.history[i].content;
            break;
          }
        }
        if (lastUserMsg) {
          this.sendQuery(lastUserMsg, true);
        }
      });
    }

    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const lang = this.getLang();
    const id = "typingIndicator_" + Date.now();
    const row = document.createElement("div");
    row.className = "chat-msg-row assistant typing-row";
    row.id = id;

    row.innerHTML = `
      <div class="chat-avatar assistant">
        <span class="material-symbols-outlined" style="font-size:18px;animation:spin 2s linear infinite;">psychiatry</span>
      </div>
      <div class="chat-msg-body">
        <div class="typing-indicator-box">
          <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
          <span class="typing-text">${I18n.t("chatAnalyzing", lang) || "Thinking..."}</span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(row);
    this.scrollToBottom(true);
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  async handleSendMessage() {
    if (!this.chatInput || this.isGenerating) return;
    const text = this.chatInput.value.trim();
    if (!text) return;

    this.resetTextarea();
    await this.sendQuery(text);
  }

  async sendMessage(text) {
    if (!text || !text.trim() || this.isGenerating) return;
    this.resetTextarea();
    await this.sendQuery(text.trim());
  }

  async sendQuery(msgText, isRegenerate = false) {
    if (!msgText || !msgText.trim() || this.isGenerating) return;
    const cleanMsg = msgText.trim();
    const lang = this.getLang();
    const loc = this.getLocation();
    const units = this.getUnits();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // If chat was empty, clear welcome hero
    const welcomeHero = this.messagesContainer.querySelector(".chat-welcome-hero");
    if (welcomeHero) {
      welcomeHero.remove();
    }

    if (!isRegenerate) {
      this.renderUserMessage(cleanMsg, timestamp);
      this.history.push({ role: "user", content: cleanMsg, timestamp });
      this.saveHistory();
    }

    this.isGenerating = true;
    if (this.sendBtn) {
      this.sendBtn.disabled = true;
      this.sendBtn.classList.add("is-generating");
    }
    const typingId = this.showTypingIndicator();

    try {
      let assistantResp = "";

      if (this.onSendCallback) {
        assistantResp = await this.onSendCallback(cleanMsg, this.history);
      } else {
        const payload = {
          message: cleanMsg,
          latitude: loc.latitude,
          longitude: loc.longitude,
          location_name: loc.name,
          units: units,
          language: lang,
          history: this.history.slice(-8).map(m => ({ role: m.role, content: m.content }))
        };
        const res = await this.apiClient("/chat", payload);
        assistantResp = res.response || I18n.t("chatError", lang);
      }

      this.removeTypingIndicator(typingId);

      const respTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const msgIdx = this.history.length;
      this.history.push({ role: "assistant", content: assistantResp, timestamp: respTime });
      this.saveHistory();

      this.renderAssistantMessage(assistantResp, respTime, msgIdx);

      // Auto-read response if speech is enabled in settings
      const isSpeechEnabled = localStorage.getItem("weathergpt_speech") !== "false";
      if (isSpeechEnabled && this.voice) {
        this.currentSpeakingIndex = msgIdx;
        this.voice.speak(assistantResp, lang, () => {
          this.currentSpeakingIndex = null;
        });
      }

    } catch (err) {
      console.error("Chat error:", err);
      this.removeTypingIndicator(typingId);
      const errMsg = I18n.t("chatError", lang) || "I couldn't process your question right now. Please try again.";
      this.renderAssistantMessage(errMsg, timestamp, this.history.length);
    } finally {
      this.isGenerating = false;
      if (this.sendBtn) {
        this.sendBtn.disabled = false;
        this.sendBtn.classList.remove("is-generating");
      }
      if (this.chatInput) {
        this.chatInput.focus();
      }
    }
  }

  clearChat() {
    this.history = [];
    this.saveHistory();
    if (this.voice) {
      if (typeof this.voice.stopSpeaking === "function") this.voice.stopSpeaking();
      else if (typeof this.voice.stop === "function") this.voice.stop();
    }
    this.currentSpeakingIndex = null;
    this.renderHistory();
  }

  startNewChat() {
    this.conversationId = this.generateConversationId();
    this.clearChat();
  }

  scrollToBottom(force = false) {
    if (!this.messagesContainer) return;
    if (force || !this.userScrolledUp) {
      this.messagesContainer.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: "smooth"
      });
    }
  }

  formatMarkdown(text) {
    if (!text) return "";
    let formatted = this.escapeHtml(text);

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');
    // Bullet points with •
    formatted = formatted.replace(/(?:^|<br>)\s*•\s*(.*?)(?=(?:<br>|\n|$))/g, '<div class="chat-bullet-item"><span class="chat-bullet-dot">•</span><span>$1</span></div>');
    // Bullet points with -
    formatted = formatted.replace(/(?:^|<br>)\s*-\s*(.*?)(?=(?:<br>|\n|$))/g, '<div class="chat-bullet-item"><span class="chat-bullet-dot">•</span><span>$1</span></div>');
    // Double newlines to paragraph break
    formatted = formatted.replace(/\n\n/g, '<div class="chat-paragraph-gap"></div>');
    // Single newlines
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Export to window
if (typeof window !== "undefined") {
  window.ChatController = ChatController;
}
