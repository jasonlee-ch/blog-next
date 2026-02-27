'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Text,
  Flex,
  Heading,
  Separator,
  Box,
} from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useToast } from '@/providers/toast-provider';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

export default function Login() {
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const { signInWithGitHub, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { disconnect } = useDisconnect();

  // 检查URL中是否有错误参数
  const error = searchParams.get('error');

  if (error) {
    showToast('登录失败', 'error');
  }

  // 如果用户已登录，重定向到首页
  if (user) {
    router.push('/');
    return null;
  }

  // 通过github登录
  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);

    try {
      const { error } = await signInWithGitHub();

      if (error) {
        showToast('GitHub 登录失败', 'error');
        console.error('GitHub 登录失败:', error.message);
        return;
      }
      showToast('GitHub 登录成功', 'success');
    } catch (error) {
      showToast('GitHub 登录失败', 'error');
      console.error('登录失败:', error);
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" p="4" style={{ flexGrow: 1 }}>
      <Card style={{ maxWidth: 450, width: '100%' }}>
        <Flex direction="column" gap="5">
          <Box className="text-center">
            <Heading as="h2" size="6" mb="1">
              登录
            </Heading>
            <Text as="p" size="2" color="gray">
              登录您的账户以管理您的博客
            </Text>
          </Box>

          <Flex asChild direction="column" gap="4">
            <section>
              <Button
                size="3"
                variant="soft"
                onClick={handleGitHubLogin}
                loading={isGitHubLoading}
                disabled={isGitHubLoading}
                style={{ width: '100%' }}
              >
                <GitHubLogoIcon width="16" height="16" />
                使用 GitHub 登录
              </Button>

              <Flex align="center" gap="3" my="3">
                <Separator size="4" style={{ flexGrow: 1 }} />
                <Text size="1" color="gray">
                  或
                </Text>
                <Separator size="4" style={{ flexGrow: 1 }} />
              </Flex>

              {/* 
                RainbowKit ConnectButton 集成了认证适配器：
                连接钱包后会自动弹出 SIWE 签名请求，验证通过后自动完成登录
              */}
              <Flex justify="center">
                {/* {mounted ? (
                  <ConnectButton label="使用钱包登录" showBalance={false} />
                ) : (
                  <Button size="3" variant="soft" disabled style={{ width: '100%' }}>
                    加载钱包连接...
                  </Button>
                )} */}
                <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const walletConnected = ready && account && chain;
                        const authenticated =
                          walletConnected &&
                          authenticationStatus === 'authenticated';

                        return (
                          <div
                            {...(!ready && {
                              'aria-hidden': true,
                              'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                          >
                            {(() => {
                              if (!walletConnected) {
                                return (
                                  <Button
                                    size="3"
                                    variant="soft"
                                    onClick={openConnectModal}
                                    style={{ width: '100%' }}
                                  >
                                    使用钱包登录
                                  </Button>
                                );
                              }

                              if (walletConnected && !authenticated) {
                                // 钱包已连接但 SIWE 认证未完成/失败：
                                // 先断开钱包，再重新打开连接弹窗以触发完整的认证流程
                                return (
                                  <Button
                                    size="3"
                                    variant="soft"
                                    onClick={() => {
                                      disconnect();
                                      setTimeout(openConnectModal, 100);
                                    }}
                                    style={{ width: '100%' }}
                                  >
                                    重新连接钱包
                                  </Button>
                                );
                              }

                              if (chain.unsupported) {
                                return (
                                  <Button
                                    size="3"
                                    variant="soft"
                                    color="red"
                                    onClick={openChainModal}
                                    style={{ width: '100%' }}
                                  >
                                    切换网络
                                  </Button>
                                );
                              }

                              return (
                                <Flex gap="3" align="center">
                                  <Button
                                    size="3"
                                    variant="soft"
                                    onClick={openChainModal}
                                  >
                                    {chain.hasIcon && (
                                      <div
                                        style={{
                                          background: chain.iconBackground,
                                          width: 12,
                                          height: 12,
                                          borderRadius: 999,
                                          overflow: 'hidden',
                                          marginRight: 4,
                                        }}
                                      >
                                        {chain.iconUrl && (
                                          <img
                                            alt={chain.name ?? 'Chain icon'}
                                            src={chain.iconUrl}
                                            style={{ width: 12, height: 12 }}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {chain.name}
                                  </Button>

                                  <Button
                                    size="3"
                                    variant="soft"
                                    onClick={openAccountModal}
                                  >
                                    {account.displayName}
                                    {account.displayBalance
                                      ? ` (${account.displayBalance})`
                                      : ''}
                                  </Button>
                                </Flex>
                              );
                            })()}
                          </div>
                        );
                      }}
                </ConnectButton.Custom>
              </Flex>
            </section>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
