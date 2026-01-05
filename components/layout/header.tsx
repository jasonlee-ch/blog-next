"use client";

import {
  TabNav,
  DropdownMenu,
  Avatar,
  Flex,
  Text,
  Box,
  Button,
  Dialog,
} from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import NextLink from "next/link";
import DonationLeaderboard from "@/app/web3/DonationLeaderBoard";

const routes = [
  {
    path: "/",
    name: "首页",
  },
  {
    path: "/category",
    name: "标签",
  },
  {
    path: "/write",
    name: "新笔记",
  },
];

export default function Header() {
  const route = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // 退出登录后重定向到首页
    router.push('/');
    router.refresh();
  };

  return (
    <div className="sticky top-0 z-50 w-full dark:border-white/10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-[#020617]/60 transition-colors duration-300">
      {/* 顶部科幻光效线条 - 调整透明度适配亮色 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 dark:opacity-100" />
      <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <header className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NextLink href="/" className="no-underline group">
          <Flex align="center" gap="3">
            {/* Logo 图标 */}
            <Box className="relative flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-indigo-600 dark:from-cyan-600 dark:to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Text size="5" weight="bold" className="text-white font-mono">J</Text>
            </Box>
            
            {/* Logo 文字 - 适配亮暗色 */}
            <Text 
              size="5" 
              weight="bold" 
              className="font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-cyan-600 to-gray-500 dark:from-white dark:via-cyan-100 dark:to-gray-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all group-hover:drop-shadow-md dark:group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              Jason<span className="text-cyan-600 dark:text-cyan-400">.</span>Blog
            </Text>
          </Flex>
        </NextLink>

        <Flex align="center" gap="6">
          <TabNav.Root size="2" style={{ backgroundColor: 'transparent' }}>
            {routes.map(({ path, name }) => (
              <TabNav.Link key={path} asChild active={route === path}>
                <NextLink 
                  href={path}
                  className={`
                    !bg-transparent transition-all duration-300
                    ${route === path 
                      ? '!text-cyan-600 !border-cyan-600 dark:!text-cyan-400 dark:!border-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                      : 'text-gray-600 hover:text-gray-900 hover:!border-gray-300 dark:text-gray-400 dark:hover:text-white dark:hover:!border-gray-600'
                    }
                  `}
                >
                  {name}
                </NextLink>
              </TabNav.Link>
            ))}
          </TabNav.Root>

          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-white/10 text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors">
                打赏
              </Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 500, padding: 0, overflow: 'hidden', height: 500 }}>
              <DonationLeaderboard />
            </Dialog.Content>
          </Dialog.Root>

          {/* <Box> */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <button type="button" className="focus:outline-none rounded-full ring-2 ring-transparent hover:ring-cyan-500/50 transition-all duration-300">
                    <Avatar
                      src={user.user_metadata?.avatar_url}
                      fallback={user.email ? user.email[0].toUpperCase() : "U"}
                      radius="full"
                      size="2"
                      className="border border-gray-200 dark:border-white/10"
                    />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" variant="soft">
                  <Box p="2">
                    <Text as="div" size="2" weight="bold">
                      {user.user_metadata?.name || user.email}
                    </Text>
                    <Text as="div" size="1" color="gray">
                      {user.email}
                    </Text>
                  </Box>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red" onClick={handleSignOut}>
                    退出登录
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-white/10 text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200" asChild>
                <NextLink href="/login">登录</NextLink>
              </Button>
            )}
          {/* </Box> */}
        </Flex>
      </header>
    </div>
  );
}