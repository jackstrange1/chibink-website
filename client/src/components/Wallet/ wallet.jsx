import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import axios from 'axios';

import './wallet.css';

// Prevent multiple Wallet components
// from authenticating at the same time
let authenticationPromise = null;
let authenticatedAddress = null;

const Wallet = () => {
  const { address, isConnected } = useAccount();

  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    const authenticateWallet = async () => {
      if (!isConnected || !address) {
        return;
      }

      const normalizedAddress = address.toLowerCase();

      // Already authenticated
      if (authenticatedAddress === normalizedAddress) {
        return;
      }

      // Another Wallet component is already
      // authenticating this wallet
      if (authenticationPromise) {
        try {
          await authenticationPromise;
        } catch {
          // Authentication error is already handled
        }

        return;
      }

      authenticationPromise = (async () => {
        try {
          // Get nonce from backend
          const nonceResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/wallet/nonce`,
            {
              walletAddress: address,
            }
          );

          const { nonce } = nonceResponse.data;

          // Message that the wallet will sign
          const message = `Sign this message to authenticate with Chibink.\n\nNonce: ${nonce}`;

          // Ask the connected wallet to sign
          const signature = await signMessageAsync({
            message,
          });

          // Send signature to backend
          // for verification
          const verifyResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/wallet/verify`,
            {
              walletAddress: address,
              signature,
              nonce,
            }
          );

          // Save authentication token
          localStorage.setItem('chibink_auth_token', verifyResponse.data.token);

          authenticatedAddress = normalizedAddress;

          console.log('Wallet authenticated successfully');
        } catch (error) {
          console.error('Wallet authentication failed:', error);

          // Allow authentication
          // to be attempted again
          authenticatedAddress = null;

          throw error;
        } finally {
          authenticationPromise = null;
        }
      })();

      try {
        await authenticationPromise;
      } catch {
        // Error already logged above
      }
    };

    authenticateWallet();
  }, [isConnected, address, signMessageAsync]);

  // Remove authentication when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      authenticatedAddress = null;
      authenticationPromise = null;

      localStorage.removeItem('chibink_auth_token');
    }
  }, [isConnected]);

  return (
    <div className="wallet-container">
      <ConnectButton />
    </div>
  );
};

export default Wallet;
