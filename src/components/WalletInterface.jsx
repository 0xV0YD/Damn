import React, { useEffect, useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import { Mic, MicOff, Wallet, History, Send } from 'lucide-react';

const WalletInterface = () => {
    const { speak, startListening, transcript, isListening, setTranscript } = useVoice();
    const [balance, setBalance] = useState(500);
    const [lastAction, setLastAction] = useState('');

    const [flowState, setFlowState] = useState('IDLE'); // IDLE, SEND_RECIPIENT, SEND_CONFIRM
    const [recipient, setRecipient] = useState('');

    // Initial Welcome
    useEffect(() => {
        const timer = setTimeout(() => {
            speak("Welcome to Blind Wallet. Double tap anywhere to check balance. Say 'History' for transactions, or 'Send' to transfer funds.");
        }, 1000);
        return () => clearTimeout(timer);
    }, [speak]);

    // Handle Voice Commands
    useEffect(() => {
        if (!transcript) return;

        const command = transcript.toLowerCase();
        console.log("Command received:", command, "State:", flowState);

        // Global Cancel
        if (command.includes('cancel') || command.includes('stop')) {
            setFlowState('IDLE');
            speak("Cancelled. Back to main menu.");
            setTranscript('');
            return;
        }

        if (flowState === 'IDLE') {
            if (command.includes('balance')) {
                handleCheckBalance();
            } else if (command.includes('history')) {
                handleHistory();
            } else if (command.includes('send') || command.includes('transfer')) {
                handleSendInit();
            } else {
                speak(`I didn't understand ${command}. Please try again.`);
            }
        } else if (flowState === 'SEND_RECIPIENT') {
            // Assume the entire transcript is the name
            handleRecipientInput(command);
        } else if (flowState === 'SEND_CONFIRM') {
            if (command.includes('yes') || command.includes('confirm')) {
                handleSendConfirm();
            } else if (command.includes('no')) {
                setFlowState('IDLE');
                speak("Transaction cancelled.");
            } else {
                speak("Please say yes to confirm or no to cancel.");
                setTimeout(startListening, 2000);
            }
        }

        setTranscript(''); // Reset after processing
    }, [transcript, speak, flowState]);

    const handleCheckBalance = () => {
        const text = `Your current balance is ${balance} USDC.`;
        setLastAction('Checked Balance');
        speak(text);
    };

    const handleHistory = () => {
        const text = "Last transaction: Received 50 USDC from Alice yesterday.";
        setLastAction('Checked History');
        speak(text);
    };

    const handleSendInit = () => {
        const text = "Who do you want to send money to? Please say the name.";
        setLastAction('Initiated Send');
        setFlowState('SEND_RECIPIENT');
        speak(text);
        setTimeout(startListening, 4000);
    };

    const handleRecipientInput = (name) => {
        setRecipient(name);
        const text = `Sending 10 USDC to ${name}. Say yes to confirm or no to cancel.`;
        setLastAction(`Confirming: ${name}`);
        setFlowState('SEND_CONFIRM');
        speak(text);
        setTimeout(startListening, 5000);
    };

    const handleSendConfirm = () => {
        const text = `Transaction sent to ${recipient}. Your new balance is ${balance - 10} USDC.`;
        setBalance(prev => prev - 10);
        setLastAction(`Sent to ${recipient}`);
        setFlowState('IDLE');
        speak(text);
    };

    // Gesture Handler (Double Tap)
    // We use a simple click handler with timing for double tap simulation if needed, 
    // but for accessibility, a large button is often better. 
    // Let's implement a full-screen tap handler.

    const handleScreenClick = (e) => {
        // Prevent double firing if clicking specific buttons
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        // Simple toggle for listening on single tap for now, or double tap logic
        // Let's make single tap = Listen
        if (!isListening) {
            speak("Listening...");
            startListening();
        }
    };

    return (
        <div
            className="min-h-screen bg-black text-yellow-400 p-6 flex flex-col items-center justify-center select-none"
            onClick={handleScreenClick}
        >
            <header className="absolute top-4 w-full text-center">
                <h1 className="text-4xl font-bold tracking-wider">BLIND WALLET</h1>
                <p className="text-xl mt-2 text-white">Voice & Gesture Operated</p>
            </header>

            <main className="flex flex-col items-center space-y-12 w-full max-w-md">

                {/* Status Display */}
                <div className="text-center space-y-4" aria-live="polite">
                    <div className="text-6xl font-mono font-bold text-white">
                        ${balance}
                    </div>
                    <div className="text-2xl text-yellow-200">
                        {lastAction || "Ready"}
                    </div>
                </div>

                {/* Visual Indicator for Listening */}
                <div className={`p-8 rounded-full transition-all duration-300 ${isListening ? 'bg-red-600 scale-110' : 'bg-gray-800'}`}>
                    {isListening ? <Mic size={64} className="text-white animate-pulse" /> : <MicOff size={64} className="text-gray-400" />}
                </div>

                {/* Explicit Controls (for low vision users) */}
                <div className="grid grid-cols-2 gap-6 w-full">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCheckBalance(); }}
                        className="bg-gray-900 border-2 border-yellow-400 p-6 rounded-xl flex flex-col items-center hover:bg-gray-800 focus:ring-4 ring-yellow-200"
                        aria-label="Check Balance"
                    >
                        <Wallet size={48} className="mb-2" />
                        <span className="text-xl font-bold">Balance</span>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleHistory(); }}
                        className="bg-gray-900 border-2 border-yellow-400 p-6 rounded-xl flex flex-col items-center hover:bg-gray-800 focus:ring-4 ring-yellow-200"
                        aria-label="Transaction History"
                    >
                        <History size={48} className="mb-2" />
                        <span className="text-xl font-bold">History</span>
                    </button>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); handleSendInit(); }}
                    className="w-full bg-yellow-400 text-black p-6 rounded-xl flex items-center justify-center space-x-4 hover:bg-yellow-300 focus:ring-4 ring-white"
                    aria-label="Send Money"
                >
                    <Send size={48} />
                    <span className="text-3xl font-bold">SEND</span>
                </button>

            </main>

            <footer className="absolute bottom-8 text-center text-gray-500">
                <p>Tap anywhere to speak</p>
            </footer>
        </div>
    );
};

export default WalletInterface;
