'use client';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { WagmiProvider } from 'wagmi';
import { config } from '@/web3/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AuthProvider } from '@/providers/auth-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { RainbowKitProvider } from '@/providers/rainbowkit-provider';
// ⚠️ 注意: 必须在组件外部创建 QueryClient 实例，避免在组件内引起死循环
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ⚠️ 注意:  suppressHydrationWarning 属性用于抑制当前层级服务端和客户端元素不匹配的警告，仅使用于当前层级，适用于主题切换等场景
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* wagmi 全局上下文注入 */}
        <WagmiProvider config={config}>
          {/* react-query全局上下文注入 */}
          <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>
                <RainbowKitProvider>
                  <Theme className="flex flex-1 flex-col">
                    <ToastProvider>
                      <Header />
                      <div className="flex-1 container mx-auto py-5 px-4">
                        {children}
                      </div>
                      <Footer />
                    </ToastProvider>
                  </Theme>
                </RainbowKitProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
