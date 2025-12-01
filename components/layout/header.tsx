"use client";

import { TabNav, ThemePanel } from "@radix-ui/themes";

import { usePathname } from "next/navigation";

const routes = [
  {
    path: "/",
    name: "首页",
  },
  {
    path: "/write",
    name: "新笔记",
  }
]

export default function Header() {

  const route = usePathname();
  return (
    <header className="w-full border-b bg-white px-4 py-4 text-center text-2xl font-bold text-gray-800">
      My Blog
      <TabNav.Root>
        {
          routes.map(({path, name}) => (
            <TabNav.Link key={path} href={path} active={route === path}>
              {name}
            </TabNav.Link>
          ))
        }
      </TabNav.Root>
      <ThemePanel></ThemePanel>
    </header>
  );
}