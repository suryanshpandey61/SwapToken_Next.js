import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import TokenB_ABI from '../contracts/abis/TokenB.json';
import TokenA_ABI from '../contracts/abis/TokenA.json';
import SWAP_ABI from '../contracts/abis/SWAP.json';

interface Web3ContextType {
  account: string | null; 
  provider: ethers.BrowserProvider | null;
  tokenBContract: ethers.Contract | null;
  tokenAContract: ethers.Contract | null;
  swapContract: ethers.Contract | null; // Add swapContract to context
  loading: boolean; // Loading state
  error: string | null; // Error state
}

const Web3Context = createContext<Web3ContextType | null>(null);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account,setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenBContract, setTokenBContract] = useState<ethers.Contract | null>(null);
  const [tokenAContract, setTokenAContract] = useState<ethers.Contract | null>(null);
  const [swapContract, setSwapContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState<string | null>(null); // Initialize error state

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          const signer = await web3Provider.getSigner();
          const userAccount = await signer.getAddress();

          const tokenB = new ethers.Contract( CONTRACT_ADDRESSES.TokenB,TokenB_ABI,signer);
          const tokenA = new ethers.Contract( CONTRACT_ADDRESSES.TokenA,TokenA_ABI,signer);
          const swap = new ethers.Contract(CONTRACT_ADDRESSES.SWAP, SWAP_ABI,signer);

          setTokenBContract(tokenB);
          setTokenAContract(tokenA);
          setSwapContract(swap);

          setAccount(userAccount);
        } else {
          throw new Error('Ethereum provider not found. Please install MetaMask.');
        }
      } catch (error) {
        console.error(error);
       //setError(error.message); // Capture the error message
      } finally {
        setLoading(false); // Set loading to false after initialization
      }
    };

    initWeb3();

    // Cleanup function
    return () => {
      setProvider(null);
      setTokenBContract(null);
      setTokenAContract(null);
      setSwapContract(null);
      setAccount(null);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ provider, tokenBContract, tokenAContract, swapContract, loading, error,account }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
