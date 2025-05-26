import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, type AuthProvider } from '@mysten/enoki';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { LogOutIcon } from 'lucide-react';

export function ConnectWallet() {
  const [currentAccountAdress, setCurrentAccountAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const currentAccount = useCurrentAccount();
  console.log('currentAccount', currentAccount);
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get('google');
  useEffect(() => {
    if (currentAccount) {
      setCurrentAccountAddress(currentAccount.address);
    } else {
      setCurrentAccountAddress(null);
    }
  }, [currentAccount]);

  const formatAddress = (address: string): string => {
    if (!address) return '';
    const firstPart = address.slice(0, 6);
    const lastPart = address.slice(-4);
    return `${firstPart}...${lastPart}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disconnectWallet = () => {
    disconnect();
    setCurrentAccountAddress(null);
  };

  return (
    <>
      {currentAccountAdress ? (
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-md cursor-pointer text-sm bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium border border-blue-500 shadow-sm transition-all duration-300 select-none"
            onClick={() => copyToClipboard(currentAccountAdress)}
            style={{
              backgroundImage: 'linear-gradient(145deg, #3b82f6, #2563eb)',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
              maxWidth: 'fit-content'
            }}
          >
            <span className="font-mono text-xs">{formatAddress(currentAccountAdress)}</span>
            {copied ? (
              <span className="text-white text-xs">✓</span>
            ) : (
              <svg
                className="w-3 h-3 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <Button
            className='w-6 h-6'
            onClick={disconnectWallet}
          >
            <LogOutIcon className="w-2 h-2" />
          </Button>
        </div>
      ) : googleWallet ? (
        <Button
          onClick={() => {
            connect({ wallet: googleWallet });
          }}
          className='bg-white'
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
        </Button>
      ) : null}
    </>
  );
}