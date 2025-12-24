"use client";

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from 'next/link';
import { Button, Card, Link as RadixLink, TextField, Text, Flex, Heading, Separator, Box } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const { signIn, signInWithGitHub } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // const { toast } = useToast()

  // 检查URL中是否有错误参数
  const error = searchParams.get("error")

  if (error) {
    // toast({
    //   title: "登录失败",
    //   description: error,
    //   variant: "destructive",
    // })
    console.error("登录失败:", error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        // toast({
        //   title: "登录失败",
        //   description: error.message,
        //   variant: "destructive",
        // })
        console.error("登录失败:", error.message)
        return
      }

      // toast({
      //   title: "登录成功",
      //   description: "欢迎回来！",
      // })

      console.log("登录成功")

      router.push("/")
      router.refresh()
    } catch (error) {
      // toast({
      //   title: "登录失败",
      //   description: "发生了未知错误，请稍后再试",
      //   variant: "destructive",
      // })
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true)

    try {
      const { error } = await signInWithGitHub()

      if (error) {
        // toast({
        //   title: "GitHub 登录失败",
        //   description: error.message,
        //   variant: "destructive",
        // })
        console.error("GitHub 登录失败:", error.message)
      }
    } catch (error) {
      // toast({
      //   title: "GitHub 登录失败",
      //   description: "发生了未知错误，请稍后再试",
      //   variant: "destructive",
      // })
      console.error('登录失败:', error)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" p="4" style={{ flexGrow: 1 }}>
      <Card style={{ maxWidth: 450, width: '100%' }}>
        <Flex direction="column" gap="5">
          <Box className="text-center">
            <Heading as="h2" size="6" mb="1">登录</Heading>
            <Text as="p" size="2" color="gray">登录您的账户以管理您的博客</Text>
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
                <Text size="1" color="gray">或</Text>
                <Separator size="4" style={{ flexGrow: 1 }} />
              </Flex>

              <form onSubmit={handleSubmit}>
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
              </form>
            </section>
          </Flex>

          <Text as="p" size="2" align="center">
            还没有账户?{" "}
            <RadixLink asChild>
              <NextLink href="/register">注册</NextLink>
            </RadixLink>
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}