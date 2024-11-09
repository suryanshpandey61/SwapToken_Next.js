import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ConnectWalletProps {
    setAddress: (address: string) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ setAddress }) => {
    const [balance, setBalance] = useState<string>('');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const holskyChainId = `0x${Number(17000).toString(16)}`;
    const holskyNetwork = {
        chainId: holskyChainId,
        chainName: 'Holsky',
        nativeCurrency: {
            name: 'holsky',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ["https://rpc.ankr.com/eth_holesky"],
        blockExplorerUrls: ["https://holesky.etherscan.io/"],
    };

    const switchToHolskyNetwork = async () => {
        try {
            if ((window as any).ethereum) {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const currentNetwork = await provider.send('eth_chainId', []);
                if (currentNetwork !== holskyChainId) {
                    try {
                        await (window as any).ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: holskyChainId }],
                        });
                    } catch (switchError: any) {
                        if (switchError.code === 4902) {
                            await (window as any).ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [holskyNetwork],
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to switch or add Holsky network:', error);
        }
    };

    const connectWallet = async () => {
        setLoading(true);
        try {
            if ((window as any).ethereum) {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await provider.send('eth_requestAccounts', []);
                const signer = await provider.getSigner();
                const walletAddress = await signer.getAddress();
                setAddress(walletAddress);

                const walletBalance = await provider.getBalance(walletAddress);
                setBalance(ethers.formatEther(walletBalance));

                await switchToHolskyNetwork();

                setTimeout(() => {
                    setIsConnected(true);
                    setLoading(false);
                }, 2000);
            } else {
                alert('MetaMask not detected!');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setLoading(true);
        setTimeout(() => {
            setAddress('');
            setBalance('');
            setIsConnected(false);
            setLoading(false);
        }, 2000);
    };

    useEffect(() => {
        connectWallet();
    }, [setAddress]);

    return (
        <div className="flex flex-col md:flex-row  w-full max-w-[1200px] justify-between mx-auto p-4">
            <div className='relative bg-black pt-[45px] '>
               <h2 className=" bg-slate-700 px-3 pt-2 text-white text-xl md:text-2xl font-bold mt-[-50px]">ETH Balance: {balance} ETH</h2>
            </div>
            

           <div>
           {loading ? (
                <p className="text-white loader mt-[-50px]"></p>
            ) : (
                !isConnected ? (
                    <button
                        onClick={connectWallet}
                        className="mt-[-50px] bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <button
                        onClick={disconnectWallet}
                        className="mt-[-50px] bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                    >
                        Disconnect Wallet
                    </button>
                )
            )}
           </div>
        </div>
    );
};

export default ConnectWallet;
