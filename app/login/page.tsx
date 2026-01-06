'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Button,
  Card,
  Link,
  Text,
  Flex,
  Heading,
  Separator,
  Box,
} from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useToast } from '@/providers/toast-provider';
import { ConnectButton, WalletButton } from '@rainbow-me/rainbowkit';
import { useSignMessage, useDisconnect, useEnsName, useEnsAvatar, useAccount } from 'wagmi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const { signIn, signInWithGitHub, signInWithWallet } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // 检查URL中是否有错误参数
  const error = searchParams.get('error');


  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  if (error) {
    // toast({
    //   title: "登录失败",
    //   description: error,
    //   variant: "destructive",
    // })

    showToast('登录失败', 'error');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        showToast('登录失败', 'error');
        console.error('登录失败:', error.message);
        return;
      }

      // toast({
      //   title: "登录成功",
      //   description: "欢迎回来！",
      // })
      showToast('登录成功', 'success');

      router.push('/');
      router.refresh();
    } catch (error) {
      // toast({
      //   title: "登录失败",
      //   description: "发生了未知错误，请稍后再试",
      //   variant: "destructive",
      // })
      showToast('登录失败,发生了未知错误，请稍后再试', 'error');
      console.error('登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // 通过钱包登录
  const handleWalletLogin = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const message = `Login to Jason.Blog\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      
      const { error } = await signInWithWallet(address, message, signature, ensName, ensAvatar);
      
      if (error) throw error;
      
      showToast('钱包登录成功', 'success');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      showToast('钱包登录失败: ' + error.message, 'error');
      disconnect(); // 如果失败，断开连接以便重试
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
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

              {/* <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <label>
                    <Text as="div" size="2" weight="bold" mb="1">电子邮件</Text>
                    <TextField.Root
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading || isGitHubLoading}
                      size="3"
                    />
                  </label>

                  <label>
                    <Flex justify="between">
                      <Text as="div" size="2" weight="bold" mb="1">密码</Text>
                      <RadixLink asChild size="2">
                        <NextLink href="/forgot-password">忘记密码?</NextLink>
                      </RadixLink>
                    </Flex>
                    <TextField.Root
                      placeholder="您的密码"
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || isGitHubLoading}
                      size="3"
                    />
                  </label>

                  <Button type="submit" disabled={isLoading || isGitHubLoading} loading={isLoading} size="3">
                    登录
                  </Button>
                </Flex>
              </form> */}
              
              {isConnected ? (
                <Flex direction="column" gap="3">
                  <Box className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <Text size="2" color="gray">已连接钱包</Text>
                    <Text as="div" weight="bold" size="2">{address?.slice(0, 6)}...{address?.slice(-4)}</Text>
                  </Box>
                  <Button onClick={handleWalletLogin} size="3" loading={isLoading}>
                    验证身份并登录
                  </Button>
                  <Button variant="ghost" color="gray" onClick={() => disconnect()}>
                    断开连接
                  </Button>
                </Flex>
              ) : (
                <Flex gap="2" justify="center" wrap="wrap">
                  <WalletButton.Custom wallet="metamask">
                    {({ ready, connect }) => (
                      <Button 
                        variant="outline" 
                        disabled={!ready} 
                        onClick={connect}
                        style={{ flex: '1 1 40%' }}
                      >
                        MetaMask
                      </Button>
                    )}
                  </WalletButton.Custom>
                  
                  <WalletButton.Custom wallet="rainbow">
                    {({ ready, connect }) => (
                      <Button 
                        variant="outline" 
                        disabled={!ready} 
                        onClick={connect}
                        style={{ flex: '1 1 40%' }}
                      >
                        Rainbow
                      </Button>
                    )}
                  </WalletButton.Custom>

                  <Flex direction="row" align="center" justify="center">
                    {/* TODO-LJJ: 调整样式占满宽度 */}
                    <ConnectButton label="更多钱包选项" showBalance={false} />
                  </Flex>
                </Flex>
              )}
            </section>
          </Flex>

          {/* <Text as="p" size="2" align="center">
            还没有账户?{" "}
            <RadixLink asChild>
              <NextLink href="/register">注册</NextLink>
            </RadixLink>
          </Text> */}
        </Flex>
      </Card>
    </Flex>
  );
}
