// src/components/TokenSwap.tsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

const TokenSwap: React.FC = () => {
  const { swapContract, tokenBContract, tokenAContract, account } = useWeb3();
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const [isTokenBToTokenA, setIsTokenBToTokenA] = useState(true);

  // New state variables to store the balances of Token A and Token B
  const [balanceA, setBalanceA] = useState<string>('0');
  const [balanceB, setBalanceB] = useState<string>('0');

  // Function to fetch balances of Token A and Token B
  const fetchBalances = async () => {
    if (!account) return;

    try {
      const balanceA = await tokenAContract?.balanceOf(account);
      const balanceB = await tokenBContract?.balanceOf(account);
      
      setBalanceA(ethers.formatUnits(balanceA || 0, 18)); // Format balance to decimals (18 decimals for ERC20 tokens)
      setBalanceB(ethers.formatUnits(balanceB || 0, 18));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  // Fetch balances when the component mounts or account changes
  useEffect(() => {
    fetchBalances();
  }, [account, tokenAContract, tokenBContract]);

  const handleApprove = async () => {
    try {
      const contractToApprove = isTokenBToTokenA ? tokenBContract : tokenAContract;
      if (!contractToApprove) throw new Error("Token contract is not initialized");

      const spenderAddress = isTokenBToTokenA ? CONTRACT_ADDRESSES.TokenA : CONTRACT_ADDRESSES.TokenB; // Set the spender address based on the swap direction

      // Use the entered swap amount and parse it to the correct decimal format (uint256 with 18 decimals)
      const amountToApprove = ethers.parseUnits(swapAmount, 18); // Convert the user input amount to 18 decimals

      // Call the approve function with spender address and amount
      const transaction = await contractToApprove.approve(spenderAddress, amountToApprove);
      await transaction.wait(); // Wait for the transaction to be confirmed
      setIsApproved(true); // Update the approval state
      console.log("Approval successful");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const handleSwap = async () => {
    if (isApproved) {
      try {
        if (!swapContract) throw new Error("Swap contract is not initialized");

        const amountToSwap = ethers.parseUnits(swapAmount, 18); // Convert the user input amount to 18 decimals

        let transaction;
        if (isTokenBToTokenA) {
          // Assume you're swapping Token B for Token A
          transaction = await swapContract.swapBtoA(amountToSwap); // Adjust this if you need specific logic for the swap
        } else {
          // Assume you're swapping Token A for Token B
          transaction = await swapContract.swapAtoB(amountToSwap); // Adjust this as needed
        }

        await transaction.wait(); // Wait for the transaction to be confirmed
        console.log("Swap successful");
        setSwapAmount(''); // Clear the input field after swap
        setIsApproved(false); // Reset approval status if necessary (depends on your UX)

        // Fetch new balances after swap
        fetchBalances();
      } catch (error) {
        console.error("Error swapping tokens:", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4  bg-[#198785]  rounded-lg shadow-lg">
      <h2 className="text-center text-4xl font-serif text-white mb-4">Token Swap</h2>
      <div className="flex flex-col gap-y-5 justify-between items-center mb-4">
        <span className='text-xl bg-slate-500 relative font-semibold rounded-md py-3 px-[150px]'>{isTokenBToTokenA ? 'TokenB' : 'TokenA'}</span>
        <button onClick={() => setIsTokenBToTokenA(!isTokenBToTokenA)} className="px-2 py-1 bg-green-500 mt-[48px] z-10 absolute rounded-2xl">
          ⇅
        </button>
        <span className='text-xl bg-slate-500 relative font-semibold rounded-md py-3 px-[150px]'>{isTokenBToTokenA ? 'TokenA' : 'TokenB'}</span>
      </div>

      {/* Display Balances */}
      <div className="text-center mb-4">
        <p className="text-white font-semibold">Balance of TokenA: {balanceA} </p>
        <p className="text-white font-semibold">Balance of TokenB: {balanceB} </p>
      </div>

      <input
        type="number"
        value={swapAmount}
        onChange={(e) => setSwapAmount(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        placeholder={!isApproved ? `Enter amount to approve` : `Enter amount to swap`}
      />

      {!isApproved ? (
        <button onClick={handleApprove} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Approve {isTokenBToTokenA ? 'TokenB' : 'TokenA'}
        </button>
      ) : (
        <button onClick={handleSwap} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Swap
        </button>
      )}
    </div>
  );
};

export default TokenSwap;
