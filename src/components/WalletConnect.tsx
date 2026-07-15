"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect?.(accounts[0]);
        } else {
          setAddress(null);
          onDisconnect?.();
        }
      });
    }
  }, []);

  const checkConnection = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect?.(accounts[0]);
        }
      } catch (err) {
        console.error("Failed to check connection:", err);
      }
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    if (typeof (window as any).ethereum === "undefined") {
      setError("MetaMask extension not found. Please install it to proceed.");
      setIsConnecting(false);
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      onConnect?.(accounts[0]);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected by user.");
      } else {
        setError("Failed to connect to MetaMask.");
      }
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    onDisconnect?.();
  };

  if (address) {
    return (
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connected Wallet</span>
          <span className="text-xs font-mono text-brand-cyan">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button 
          onClick={disconnect}
          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        onClick={connect}
        disabled={isConnecting}
        className={`
          relative group px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3
          ${isConnecting 
            ? 'bg-white/5 text-gray-500 cursor-wait' 
            : 'bg-brand-cyan text-dark-bg shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98]'}
        `}
      >
        {isConnecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        )}
        {isConnecting ? 'Establishing Connection...' : 'Connect MetaMask'}
      </button>

      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Secure Owner-Only Access via Web3
      </p>
    </div>
  );
}
