"use client";

import {
  TabNav,
  DropdownMenu,
  Avatar,
  Flex,
  Text,
  Box,
  Button,
} from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import NextLink from "next/link";

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
    <header className="w-full px-4 py-4 flex items-center justify-between border-b">
      <Text size="6" weight="bold" className="text-gray-800">
        <NextLink href="/">Jason&apos;s Blog</NextLink>
      </Text>

      <Flex align="center" gap="6">
        <TabNav.Root>
          {routes.map(({ path, name }) => (
            <TabNav.Link key={path} asChild active={route === path}>
              <NextLink href={path}>
                {name}
              </NextLink>
            </TabNav.Link>
          ))}
        </TabNav.Root>

        <Box>
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <button type="button" className="focus:outline-none">
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    fallback={user.email ? user.email[0].toUpperCase() : "U"}
                    radius="full"
                    size="2"
                  />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
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
            <Button variant="ghost" asChild>
              <NextLink href="/login">登录</NextLink>
            </Button>
          )}
        </Box>
      </Flex>
    </header>
  );
}