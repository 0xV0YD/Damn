import { useState, useEffect, useCallback } from 'react';

export const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
    }

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const startListening = useCallback(() => {
        if (!recognition) {
            speak("Voice recognition is not supported in this browser.");
            return;
        }

        try {
            recognition.start();
            setIsListening(true);
        } catch (error) {
            console.error("Speech recognition error:", error);
        }
    }, [recognition, speak]);

    const stopListening = useCallback(() => {
        if (!recognition) return;
        recognition.stop();
        setIsListening(false);
    }, [recognition]);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }, [recognition]);

    return {
        isListening,
        isSpeaking,
        transcript,
        speak,
        startListening,
        stopListening,
        setTranscript // Allow resetting transcript
    };
};
