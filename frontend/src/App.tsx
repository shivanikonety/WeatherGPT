import React, { useState, useEffect } from 'react';

import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { ChatArea } from './components/Chat/ChatArea';
import { InputBox } from './components/Input/InputBox';
import { SevereAlertBanner } from './components/Alerts/SevereAlertBanner';
import { LocationModal } from './components/Modals/LocationModal';
import { SettingsModal } from './components/Modals/SettingsModal';

import {
  ChatSession,
  LocationInfo,
  Message,
  UserSettings,
  WeatherAlert,
} from './types/weather';

import {
  INITIAL_CHAT_SESSIONS,
  ACTIVE_SEVERE_ALERT,
  PUNE_WEATHER_DATA,
} from './services/mockData';

import { processWeatherQuery } from './services/weatherService';

// Voice / Text-to-Speech service
import { speechService } from './services/speechService';


export const App: React.FC = () => {

  // --------------------------------------------------
  // CHAT SESSIONS
  // --------------------------------------------------

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('weathergpt_sessions');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved sessions:', e);
      }
    }

    return INITIAL_CHAT_SESSIONS;
  });


  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    INITIAL_CHAT_SESSIONS[0]?.id || null
  );


  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedModel, setSelectedModel] = useState('weathergpt-4o');

  const [activeAlert, setActiveAlert] =
    useState<WeatherAlert | null>(ACTIVE_SEVERE_ALERT);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);


  // --------------------------------------------------
  // CURRENT WEATHER LOCATION
  // --------------------------------------------------

  const [currentLocation, setCurrentLocation] =
    useState<LocationInfo>({
      name: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5204,
      longitude: 73.8567,
    });


  // --------------------------------------------------
  // USER SETTINGS
  // --------------------------------------------------

  const [settings, setSettings] = useState<UserSettings>({
    unit: 'metric',

    // IMPORTANT:
    // This is the selected language.
    language: 'hi',

    autoDetectLanguage: true,

    defaultCity: 'Pune',
    defaultLat: 18.5204,
    defaultLon: 73.8567,

    voiceRate: 1.0,
    thinkingMode: false,
    highContrast: false,
    theme: 'dark',
  });


  // --------------------------------------------------
  // SAVE SESSIONS
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      'weathergpt_sessions',
      JSON.stringify(sessions)
    );
  }, [sessions]);


  // --------------------------------------------------
  // SAVE SETTINGS
  // --------------------------------------------------
  // This makes the selected language persist after refresh.

  useEffect(() => {
    localStorage.setItem(
      'weathergpt_settings',
      JSON.stringify(settings)
    );
  }, [settings]);


  // --------------------------------------------------
  // RESPONSIVE SIDEBAR
  // --------------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);


  // --------------------------------------------------
  // GLOBAL KEYBOARD SHORTCUTS
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      // Ctrl/Cmd + N = New Chat
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'n'
      ) {
        e.preventDefault();
        handleNewChat();
      }


      // Ctrl/Cmd + [ = Toggle Sidebar
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === '['
      ) {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };


    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [sessions]);


  // --------------------------------------------------
  // ACTIVE SESSION
  // --------------------------------------------------

  const activeSession =
    sessions.find(s => s.id === activeSessionId) || null;

  const currentMessages =
    activeSession ? activeSession.messages : [];


  // --------------------------------------------------
  // CREATE NEW CHAT
  // --------------------------------------------------

  const handleNewChat = () => {

    const newId = `chat-${Date.now()}`;

    const newSession: ChatSession = {
      id: newId,
      title: 'New Weather Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      category: 'today',
    };


    setSessions(prev => [
      newSession,
      ...prev,
    ]);

    setActiveSessionId(newId);
  };


  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSendMessage = async (userText: string) => {

    if (!userText.trim() || isLoading) {
      return;
    }


    let targetSessionId = activeSessionId;
    let targetSession = activeSession;


    // --------------------------------------------------
    // CREATE SESSION IF NECESSARY
    // --------------------------------------------------

    if (!targetSessionId || !targetSession) {

      const newId = `chat-${Date.now()}`;

      targetSession = {
        id: newId,
        title:
          userText.slice(0, 32) +
          (userText.length > 32 ? '...' : ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        category: 'today',
      };

      targetSessionId = newId;

      setSessions(prev => [
        targetSession!,
        ...prev,
      ]);

      setActiveSessionId(newId);

    } else if (targetSession.messages.length === 0) {

      // Set title from first query
      targetSession.title =
        userText.slice(0, 32) +
        (userText.length > 32 ? '...' : '');
    }


    // --------------------------------------------------
    // USER MESSAGE
    // --------------------------------------------------

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userText,

      timestamp: new Date().toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
    };


    // --------------------------------------------------
    // ADD USER MESSAGE
    // --------------------------------------------------

    setSessions(prev =>
      prev.map(s =>
        s.id === targetSessionId
          ? {
            ...s,

            title:
              s.messages.length === 0
                ? userText.slice(0, 32)
                : s.title,

            updatedAt: new Date().toISOString(),

            messages: [
              ...s.messages,
              userMessage,
            ],
          }
          : s
      )
    );


    setIsLoading(true);


    try {

      // --------------------------------------------------
      // DEEP THINKING
      // --------------------------------------------------

      const isDeepThinking =
        settings.thinkingMode ||
        selectedModel === 'deepweather-r1';


      // --------------------------------------------------
      // IMPORTANT LANGUAGE FIX
      // --------------------------------------------------
      //
      // BEFORE:
      //
      // processWeatherQuery(
      //   userText,
      //   currentLocation,
      //   settings.unit,
      //   isDeepThinking
      // )
      //
      // NOW:
      //
      // We pass settings.language to the backend.
      //
      // This tells WeatherGPT which language the AI response
      // should use.
      // --------------------------------------------------

      const result = await processWeatherQuery(
        userText,
        currentLocation,
        settings.unit,
        isDeepThinking,
        settings.language || 'hi'
      );


      // --------------------------------------------------
      // AI RESPONSE
      // --------------------------------------------------

      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        role: 'assistant',
        content: result.text,

        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),

        // IMPORTANT:
        // Store the selected language with the message.
        language:
          result.language ||
          settings.language ||
          'hi',

        weatherData: result.weatherData,

        thoughtProcess: result.thoughtProcess,
      };


      // --------------------------------------------------
      // ADD AI MESSAGE
      // --------------------------------------------------

      setSessions(prev =>
        prev.map(s =>
          s.id === targetSessionId
            ? {
              ...s,

              updatedAt: new Date().toISOString(),

              messages: [
                ...s.messages,
                assistantMessage,
              ],
            }
            : s
        )
      );


      // --------------------------------------------------
      // AUTOMATIC AI SPEECH
      // --------------------------------------------------

      if (result.text) {

        // Stop previous speech
        speechService.cancelSpeak();


        // IMPORTANT:
        // Always prefer the CURRENTLY SELECTED language.
        //
        // Previously result.language could be English
        // because backend/frontend was not passing the
        // selected language correctly.
        //
        // Now selected language is the source of truth.

        const speechLanguage =
          settings.language ||
          result.language ||
          'hi';


        speechService.speak(
          result.text,
          speechLanguage
        );
      }


      // --------------------------------------------------
      // UPDATE LOCATION
      // --------------------------------------------------

      if (result.weatherData?.location) {

        setCurrentLocation(
          result.weatherData.location
        );
      }


    } catch (err) {

      console.error(
        'Failed to process message:',
        err
      );


      // --------------------------------------------------
      // ERROR MESSAGE
      // --------------------------------------------------

      const errorMessage: Message = {
        id: `msg-err-${Date.now()}`,

        role: 'assistant',

        content:
          'Sorry, I encountered an issue retrieving the latest meteorological models. Please try again.',

        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),

        error: true,
      };


      setSessions(prev =>
        prev.map(s =>
          s.id === targetSessionId
            ? {
              ...s,

              messages: [
                ...s.messages,
                errorMessage,
              ],
            }
            : s
        )
      );

    } finally {

      setIsLoading(false);
    }
  };


  // --------------------------------------------------
  // SESSION FUNCTIONS
  // --------------------------------------------------

  const handleRenameSession = (
    id: string,
    newTitle: string
  ) => {

    setSessions(prev =>
      prev.map(s =>
        s.id === id
          ? {
            ...s,
            title: newTitle,
          }
          : s
      )
    );
  };


  const handleDeleteSession = (id: string) => {

    setSessions(prev => {

      const filtered =
        prev.filter(s => s.id !== id);


      if (activeSessionId === id) {

        setActiveSessionId(
          filtered[0]?.id || null
        );
      }


      return filtered;
    });
  };


  const handleTogglePinSession = (id: string) => {

    setSessions(prev =>
      prev.map(s =>
        s.id === id
          ? {
            ...s,
            isPinned: !s.isPinned,
          }
          : s
      )
    );
  };


  const handleClearAllChats = () => {

    setSessions([]);

    setActiveSessionId(null);

    localStorage.removeItem(
      'weathergpt_sessions'
    );
  };


  // --------------------------------------------------
  // SETTINGS
  // --------------------------------------------------

  const handleToggleUnit = () => {

    const nextUnit =
      settings.unit === 'metric'
        ? 'imperial'
        : 'metric';


    setSettings(prev => ({
      ...prev,
      unit: nextUnit,
    }));
  };


  // --------------------------------------------------
  // LANGUAGE SELECTOR
  // --------------------------------------------------

  const handleLanguageChange = (lang: string) => {

    console.log(
      'WeatherGPT language changed to:',
      lang
    );

    setSettings(prev => ({
      ...prev,
      language: lang,
      // IMPORTANT:
      // When user manually selects a language,
      // don't let automatic detection override it.
      autoDetectLanguage: false,
    }));


    // Stop speech in previous language
    speechService.cancelSpeak();
  };


  // --------------------------------------------------
  // SHARE CHAT
  // --------------------------------------------------

  const handleShareChat = () => {

    if (navigator.clipboard) {

      navigator.clipboard.writeText(
        window.location.href
      );

      alert(
        'Forecast link copied to clipboard!'
      );
    }
  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      className={`flex h-screen w-screen overflow-hidden ${settings.theme === 'black'
        ? 'bg-[#000000]'
        : 'bg-[#212121]'
        } text-[#ececec]`}
    >

      {/* --------------------------------------------------
          SIDEBAR
      -------------------------------------------------- */}

      <Sidebar
        isOpen={sidebarOpen}

        onClose={() =>
          setSidebarOpen(false)
        }

        sessions={sessions}

        activeSessionId={activeSessionId}

        onSelectSession={(id) =>
          setActiveSessionId(id)
        }

        onNewChat={handleNewChat}

        onRenameSession={
          handleRenameSession
        }

        onDeleteSession={
          handleDeleteSession
        }

        onTogglePinSession={
          handleTogglePinSession
        }

        onOpenSettings={() =>
          setSettingsModalOpen(true)
        }
      />


      {/* --------------------------------------------------
          MAIN CHAT AREA
      -------------------------------------------------- */}

      <main
        className="flex-1 flex flex-col h-full min-w-0 relative"
      >

        {/* --------------------------------------------------
            SEVERE WEATHER ALERT
        -------------------------------------------------- */}

        {activeAlert && (

          <SevereAlertBanner
            alert={activeAlert}

            onDismiss={() =>
              setActiveAlert(null)
            }
          />

        )}


        {/* --------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <Header
          sidebarOpen={sidebarOpen}

          onToggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }

          onNewChat={handleNewChat}

          currentLocation={
            currentLocation
          }

          currentTemp={
            PUNE_WEATHER_DATA.current.temperature
          }

          onOpenLocationModal={() =>
            setLocationModalOpen(true)
          }

          settings={settings}

          onLanguageChange={
            handleLanguageChange
          }

          onToggleUnit={
            handleToggleUnit
          }

          selectedModel={
            selectedModel
          }

          onSelectModel={
            setSelectedModel
          }

          onShareChat={
            handleShareChat
          }
        />


        {/* --------------------------------------------------
            CHAT
        -------------------------------------------------- */}

        <ChatArea
          messages={currentMessages}

          isLoading={isLoading}

          unit={settings.unit}

          // IMPORTANT:
          // Pass selected language to ChatArea.
          language={settings.language || 'hi'}

          userName="KP"

          currentLocation={
            currentLocation
          }

          onSelectPrompt={(query) =>
            handleSendMessage(query)
          }

          onRegenerateLast={() => {

            if (currentMessages.length >= 2) {

              const lastUser =
                [...currentMessages]
                  .reverse()
                  .find(
                    m => m.role === 'user'
                  );


              if (lastUser) {

                handleSendMessage(
                  lastUser.content
                );
              }
            }
          }}
        />


        {/* --------------------------------------------------
            INPUT
        -------------------------------------------------- */}

        <InputBox
          onSend={handleSendMessage}
          isLoading={isLoading}

          // IMPORTANT:
          // This controls voice recognition language.
          language={settings.language || 'hi'}
        />

      </main>


      {/* --------------------------------------------------
          LOCATION MODAL
      -------------------------------------------------- */}

      <LocationModal
        isOpen={
          locationModalOpen
        }

        onClose={() =>
          setLocationModalOpen(false)
        }

        currentLocation={
          currentLocation
        }

        onSelectLocation={(loc) => {

          setCurrentLocation(loc);

          handleSendMessage(
            `Weather forecast and rain outlook for ${loc.name}`
          );
        }}
      />


      {/* --------------------------------------------------
          SETTINGS MODAL
      -------------------------------------------------- */}

      <SettingsModal
        isOpen={
          settingsModalOpen
        }

        onClose={() =>
          setSettingsModalOpen(false)
        }

        settings={
          settings
        }

        onUpdateSettings={(newSettings) =>
          setSettings(prev => ({
            ...prev,
            ...newSettings,
          }))
        }

        onClearAllChats={
          handleClearAllChats
        }
      />

    </div>
  );
};


export default App;