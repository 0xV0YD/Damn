
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useHaptics } from '../hooks/useHaptics';
import { useGestures } from '../hooks/useGestures';
import { Mic, MicOff, Wallet, History, Send, UserPlus, ShieldCheck, Zap, Activity, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const WalletInterface = () => {
  const { speak, startListening, transcript, isListening, setTranscript } = useVoice();
  const { trigger, vibrate, getBraillePattern } = useHaptics();
  const [balance, setBalance] = useState(500);
  const [lastAction, setLastAction] = useState('');

  // State Machine
  // State Machine
  const [flowState, setFlowState] = useState('IDLE');

  const [tempData, setTempData] = useState({ recipient: '', amount: 0, contactName: '' });
  const [whitelist, setWhitelist] = useState(['Alice', 'Bob']);
  const [history, setHistory] = useState([]);

  // Refs for canvas animation
  const canvasRef = useRef(null);

  // Initial Welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("System Online. Blind Wallet Active. Awaiting Command.");
    }, 1000);
    return () => clearTimeout(timer);
  }, [speak]);

  // Canvas Animation Loop (The "Crazy" Visuals)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 60 + 200}, 100 %, 50 %)`; // Blue/Cyan range
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.01;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.update();
        p.draw();
        // Connect particles
        particles.forEach((p2, index2) => {
          if (index === index2) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // If listening, add chaotic energy
      if (isListening) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle());
          if (particles.length > 200) particles.shift();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening]);

  // Handle Voice Commands (Same logic, new style)
  useEffect(() => {
    if (!transcript) return;
    const command = transcript.toLowerCase();
    console.log("CMD:", command);

    if (command.includes('cancel') || command.includes('stop')) {
      resetFlow("Aborting.");
      return;
    }

    switch (flowState) {
      case 'IDLE':
        if (command.includes('balance')) handleCheckBalance();
        else if (command.includes('history')) handleHistory();
        else if (command.includes('send') || command.includes('transfer')) handleSendInit();
        else if (command.includes('add contact') || command.includes('whitelist')) handleAddContactInit();
        else speak(`Command not recognized: ${command} `).then(startListening);
        break;
      case 'SEND_RECIPIENT': handleRecipientInput(command); break;
      case 'SEND_AMOUNT': handleAmountInput(command); break;
      case 'SEND_CONFIRM':
        if (command.includes('yes')) handleSendExecute();
        else if (command.includes('no')) resetFlow("Cancelled.");
        break;
      case 'ADD_CONTACT_NAME': handleAddContactName(command); break;
      case 'ADD_CONTACT_CONFIRM':
        if (command.includes('yes')) handleAddContactExecute();
        else if (command.includes('no')) resetFlow("Cancelled.");
        break;
      default: break;
    }
    setTranscript('');
  }, [transcript, flowState]);

  const resetFlow = (msg) => { setFlowState('IDLE'); setTempData({ recipient: '', amount: 0, contactName: '' }); if (msg) speak(msg); };
  const handleCheckBalance = () => { setLastAction('Balance Checked'); speak(`Balance: ${balance} USDC`); };
  const handleHistory = () => {
    setLastAction('History Checked');
    if (history.length === 0) {
      speak("No recent transactions.");
    } else {
      const last = history[history.length - 1];
      speak(`Last: Sent ${last.amount} to ${last.recipient}`);
    }
  };
  const handleSendInit = () => { setFlowState('SEND_RECIPIENT'); speak("Recipient?").then(startListening); };
  const handleRecipientInput = (name) => { setTempData(p => ({ ...p, recipient: name })); setFlowState('SEND_AMOUNT'); speak(`Amount for ${name} ? `).then(startListening); };
  const handleAmountInput = (input) => {
    const nums = input.match(/\d+/);
    if (!nums) { speak("Repeat amount.").then(startListening); return; }
    const amt = parseInt(nums[0]);
    setTempData(p => ({ ...p, amount: amt })); setFlowState('SEND_CONFIRM'); speak(`Send ${amt} to ${tempData.recipient}?`).then(startListening);
  };
  const handleSendExecute = () => {
    setBalance(p => p - tempData.amount);
    setHistory(p => [...p, { type: 'sent', amount: tempData.amount, recipient: tempData.recipient, date: new Date() }]);
    resetFlow(`Sent ${tempData.amount}.`);
    setLastAction(`Sent ${tempData.amount} to ${tempData.recipient} `);
  };
  const handleAddContactInit = () => { setFlowState('ADD_CONTACT_NAME'); speak("Name?").then(startListening); };
  const handleAddContactName = (name) => { setTempData(p => ({ ...p, contactName: name })); setFlowState('ADD_CONTACT_CONFIRM'); speak(`Add ${name}?`).then(startListening); };
  const handleAddContactExecute = () => { setWhitelist(p => [...p, tempData.contactName]); resetFlow("Added."); setLastAction(`Added ${tempData.contactName} `); };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (flowState !== 'IDLE') return; // Only allow shortcuts in IDLE for now

      const key = e.key.toLowerCase();
      switch (key) {
        case 'b':
          trigger('click');
          handleCheckBalance();
          break;
        case 'h':
          trigger('click');
          handleHistory();
          break;
        case 's':
          trigger('click');
          handleSendInit();
          break;
        case 'a':
          trigger('click');
          handleAddContactInit();
          break;
        case 'w':
          trigger('click');
          speak(`List: ${whitelist.join(', ')} `);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flowState, whitelist, trigger, speak, startListening]); // Dependencies for closure capture

  const handleScreenClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    // Onboarding logic removed

    // Fallback if gestures don't catch it (e.g. desktop click without drag)

    // Fallback if gestures don't catch it (e.g. desktop click without drag)
    // But useGestures handles mouse events too, so we might not need this.
    // Actually, let's keep it for "Listening" trigger if gestures are idle?
    // No, gestures replace this.
  };

  // Gesture Handlers
  const onSingleTap = useCallback(() => {
    console.log("onSingleTap called. FlowState:", flowState);
    if (flowState !== 'IDLE') return;
    trigger('click');
    handleCheckBalance();
  }, [flowState, trigger]);

  const onDoubleTap = useCallback(() => {
    console.log("onDoubleTap called. FlowState:", flowState);
    if (flowState !== 'IDLE') return;
    trigger('success'); // Distinct feel
    handleHistory();
  }, [flowState, trigger, history]); // Added history dependency

  const onTripleTap = useCallback(() => {
    console.log("onTripleTap called. FlowState:", flowState);
    if (flowState !== 'IDLE') return;
    trigger('warning'); // Heavy vibration
    handleSendInit();
  }, [flowState, trigger]);

  const onLongPress = useCallback(() => {
    console.log("onLongPress called. FlowState:", flowState);
    if (flowState !== 'IDLE') return;
    trigger('warning'); // Heavy vibration
    handleSendInit();
  }, [flowState, trigger]);

  const gestureHandlers = useGestures({ onSingleTap, onDoubleTap, onLongPress, onTripleTap });

  return (
    <div
      className="relative min-h-screen bg-black text-cyan-400 overflow-hidden font-mono select-none"
      {...gestureHandlers}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />

      {/* Holographic Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen p-6">

        {/* Top HUD */}
        <header className="w-full flex justify-between items-center border-b border-cyan-500/30 pb-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Activity className="animate-pulse text-cyan-400" />
            <span className="text-xs tracking-[0.3em] text-cyan-200">SYSTEM.READY</span>
          </div>
          <div className="text-xs text-cyan-600">{new Date().toLocaleTimeString()}</div>
        </header>

        {/* Central Core */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg gap-12">

          {/* The Orb */}
          <div className="relative group cursor-pointer" onClick={() => !isListening && startListening()}>
            <motion.div
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                rotate: isListening ? 360 : 0
              }}
              transition={{ duration: isListening ? 2 : 10, repeat: Infinity, ease: "linear" }}
              className={cn(
                "w-64 h-64 rounded-full border-4 flex items-center justify-center backdrop-blur-md transition-all duration-500",
                isListening ? "border-red-500 bg-red-500/10 shadow-[0_0_100px_rgba(239,68,68,0.5)]" : "border-cyan-500 bg-cyan-500/5 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
              )}
            >
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/30 animate-spin-slow"></div>
              <div className="absolute inset-8 rounded-full border border-dotted border-cyan-500/50 animate-reverse-spin"></div>

              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="mic-on"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  >
                    <Mic size={64} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic-off"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  >
                    <Zap size={64} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,1)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Status Text */}
            <motion.div
              layout
              className="absolute -bottom-16 left-0 right-0 text-center"
            >
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 tracking-tighter">
                ${balance}
              </h2>
              <p className="text-cyan-600 text-sm tracking-widest mt-2 uppercase">{lastAction || "Awaiting Input"}</p>
            </motion.div>
          </div>

          {/* Action Matrix */}
          <div className="grid grid-cols-2 gap-4 w-full mt-12">
            <CyberButton icon={<Wallet />} label="BALANCE" onClick={handleCheckBalance} />
            <CyberButton icon={<History />} label="HISTORY" onClick={handleHistory} />
            <CyberButton icon={<UserPlus />} label="ADD USER" onClick={handleAddContactInit} />
            <CyberButton icon={<ShieldCheck />} label="WHITELIST" onClick={() => speak(`List: ${whitelist.join(', ')} `)} />
          </div>

          <motion.button
            whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleSendInit(); }}
            className="w-full bg-cyan-500 text-black font-black py-6 text-2xl tracking-widest clip-path-polygon hover:bg-cyan-400 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
          >
            INITIATE TRANSFER
          </motion.button>

        </main>
      </div>
    </div>
  );
};

const CyberButton = ({ icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(6,182,212,0.2)" }}
    whileTap={{ scale: 0.95 }}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="relative group overflow-hidden border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center gap-3"
  >
    <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
    <div className="relative z-10 text-cyan-400 group-hover:text-white transition-colors">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <span className="relative z-10 text-xs font-bold tracking-[0.2em] text-cyan-600 group-hover:text-cyan-200 transition-colors">
      {label}
    </span>
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500"></div>
  </motion.button>
);

export default WalletInterface;

