"use client"

import type React from "react"
import { useState } from "react"
import NextLink from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Button, Card, Link as RadixLink, TextField, Text, Flex, Heading, Separator, Box } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const { signUp, signInWithGitHub } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      console.error("密码不匹配: 请确保两次输入的密码相同")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password)

      if (error) {
        console.error("注册失败:", error.message)
        return
      }

      console.log("注册成功，请检查您的邮箱以确认您的账户")

      router.push("/login")
    } catch (error) {
      console.error("注册失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true)

    try {
      const { error } = await signInWithGitHub()

      if (error) {
        console.error("GitHub 登录失败:", error.message)
      }
    } catch (error) {
      console.error("GitHub 登录失败:", error)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  const isFormDisabled = isLoading || isGitHubLoading;

  return (
    <Flex align="center" justify="center" p="4" style={{ flexGrow: 1 }}>
      <Card style={{ maxWidth: 450, width: '100%' }}>
        <Flex direction="column" gap="5">
          <Box className="text-center">
            <Heading as="h2" size="6" mb="1">注册</Heading>
            <Text as="p" size="2" color="gray">创建一个新账户以开始使用博客系统</Text>
          </Box>

          <Flex asChild direction="column" gap="4">
            <section>
              <Button
                size="3"
                variant="soft"
                onClick={handleGitHubLogin}
                loading={isGitHubLoading}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              >
                <GitHubLogoIcon width="16" height="16" />
                使用 GitHub 注册
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
                      disabled={isFormDisabled}
                      size="3"
                    />
                  </label>

                  <label>
                    <Text as="div" size="2" weight="bold" mb="1">密码</Text>
                    <TextField.Root
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="您的密码"
                      required
                      disabled={isFormDisabled}
                      size="3"
                    />
                  </label>

                  <label>
                    <Text as="div" size="2" weight="bold" mb="1">确认密码</Text>
                    <TextField.Root
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再次输入您的密码"
                      required
                      disabled={isFormDisabled}
                      size="3"
                    />
                  </label>

                  <Button type="submit" disabled={isFormDisabled} loading={isLoading} size="3">
                    注册
                  </Button>
                </Flex>
              </form>
            </section>
          </Flex>

          <Text as="p" size="2" align="center">
            已有账户?{" "}
            <RadixLink asChild>
              <NextLink href="/login">登录</NextLink>
            </RadixLink>
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}
