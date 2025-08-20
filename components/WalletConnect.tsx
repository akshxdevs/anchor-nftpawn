'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
    try {
      // Check if Phantom is installed
      const solana = (window as any).solana;
      if (!solana || !solana.isPhantom) {
        toast.error('Phantom wallet is not installed. Please install it first.');
        return;
      }

      // Connect to wallet
      const response = await solana.connect();
      const address = response.publicKey.toString();
      
      setWalletAddress(address);
      setIsConnected(true);
      onConnect?.(address);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    toast.success('Wallet disconnected');
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3"
      >
        <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Connected
          </span>
        </div>
        <button
          onClick={copyAddress}
          className="flex items-center space-x-2 bg-white dark:bg-dark-800 px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
        >
          <span className="text-sm font-mono text-dark-700 dark:text-dark-300">
            {shortenAddress(walletAddress)}
          </span>
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-dark-500" />
          )}
        </button>
        <button
          onClick={disconnectWallet}
          className="text-sm text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200 transition-colors"
        >
          Disconnect
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={connectWallet}
      className="btn-primary flex items-center space-x-2"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
    </motion.button>
  );
} 