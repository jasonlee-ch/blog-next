'use client';

import { useMounted } from '@/hooks/use-mounted';
import {
  RainbowKitProvider as OriginalRainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  lightTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { createSiweMessage } from 'viem/siwe';
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import type { AuthenticationStatus } from '@rainbow-me/rainbowkit';

export function RainbowKitProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { mounted } = useMounted();
  const { user, loading,  setSessionFromWallet, signOut: authSignOut } = useAuth();

  // 根据 AuthProvider 的状态推导 RainbowKit 认证状态
  const authStatus: AuthenticationStatus = useMemo(() => {
    if (loading) return 'loading';
    return user ? 'authenticated' : 'unauthenticated';
  }, [loading, user]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
  }, [authSignOut]);

  // 创建 SIWE 认证适配器
  const authenticationAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const response = await fetch('/auth/nonce');
          return await response.text();
        },

        createMessage: ({ nonce, address, chainId }) => {
          return createSiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in with Ethereum to Jason.Blog',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          });
        },

        verify: async ({ message, signature }) => {
          try {
            console.log('verify message', message);
            const response = await fetch('/auth/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message, signature }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Wallet verify failed:', errorData.error || response.statusText);
              return false;
            }

            const data = await response.json();
            // 将后端返回的 session 同步到 Supabase 客户端
            await setSessionFromWallet(data.session);
            return true;
          } catch (error) {
            console.error('Wallet verify error:', error);
            return false;
          }
        },

        signOut: handleSignOut,
      }),
    [setSessionFromWallet, handleSignOut]
  );

  // ✨ 重点：关注嵌套关系，RainbowKitAuthenticationProvider 必须包裹 RainbowKitProvider 外
  // 因为Modal的打开关闭需要依赖于RainbowKitAuthenticationProvider的状态，而Modal的Provider在RainbowKitProvider之内，如果RainbowKitProvider在外层，则无法访问到authStatus状态
  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={authStatus}
    >
      <OriginalRainbowKitProvider
        theme={mounted && resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
      >
        {children}
      </OriginalRainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}
