import React, { useState, useEffect } from 'react';
import { LuMic } from 'react-icons/lu';

export default function VoiceInput({ onTranscript, className = "" }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
    };

    setRecognition(rec);
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      alert("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-1.5 rounded-lg border transition-all inline-flex items-center justify-center cursor-pointer ${
        isListening
          ? "bg-accent-red/10 border-accent-red text-accent-red animate-pulse"
          : "bg-bg border-border text-ink-muted hover:text-accent-rust hover:border-accent-rust"
      } ${className}`}
      title={isListening ? "Listening... click to stop" : "Use Voice-to-Text"}
    >
      <LuMic className="text-xs" />
    </button>
  );
}
