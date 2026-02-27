'use client';

import { IconButton, Tooltip } from '@radix-ui/themes';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  // ⚠️ 注意: useSyncExternalStore的作用 - 保证在服务端和前端水合时，两者状态一致
  // react 18+版本可用
  const { mounted } = useMounted();

  // react17及以下版本可用下面的写法
  // const [mounted, setMounted] = useState(false)
  // useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <IconButton variant="ghost" color="gray" disabled>
        <SunIcon width="18" height="18" />
      </IconButton>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tooltip content="切换主题">
      <IconButton variant="ghost" color="gray" onClick={toggleTheme} className="cursor-pointer">
        {resolvedTheme === 'dark' ? (
          <MoonIcon width="18" height="18" />
        ) : (
          <SunIcon width="18" height="18" />
        )}
      </IconButton>
    </Tooltip>
  );
}