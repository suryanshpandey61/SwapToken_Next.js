import TokenSwap from '../components/TokenSwap';
import { useState } from 'react';
import ConnectWallet from '../components/ConnectWallet'
import '../app/globals.css'

const Home = () => {

  const [address, setAddress] = useState<string>('');

  return (
  <div className="min-h-screen flex flex-col gap-y-9 items-center justify-center home-screen">
    <ConnectWallet setAddress={setAddress} />
    <TokenSwap />
  </div>
  )
};

export default Home;
