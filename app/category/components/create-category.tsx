'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button, TextField, Text, Flex, Dialog, TextArea, Box, Card } from '@radix-ui/themes';
import { Category } from '@/types';
import { PlusIcon } from '@radix-ui/react-icons';
import { useToast } from '@/providers/toast-provider';

export default function CreateCategory({
  onCreateSuc,
}: {
  onCreateSuc: (cate: Category) => void,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const router = useRouter();
  const supabase = getSupabaseClient();

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 简单的 slug 生成逻辑：转小写，替换非字母数字为连字符
    // 如果生成为空（如纯中文），则使用随机后缀
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!slug) {
      slug = `cat-${Math.floor(Math.random() * 100000)}`;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name, description, slug })
      .select()
      .single();

    if (error) {
      showToast(`创建失败，请稍后重试`, 'error');
      console.error('创建失败，请稍后重试', error?.message);
    } else {
      onCreateSuc(data);
      setIsOpen(false);
      showToast(`创建成功`, 'success');
      router.refresh(); // 刷新服务端数据
    }
    setLoading(false);
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>
        <Card className="rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex">
          {/* <button className="border border-gray-200 dark:!text-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white flex items-center justify-center cursor-pointer"> */}
          <button className="border-none flex items-center justify-center cursor-pointer w-full h-full"> 
            <PlusIcon height={30} width={30}></PlusIcon>
          </button>
        </Card>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title className="text-xl font-bold mb-4">创建标签</Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" weight="bold" mb="2">
                标签名 (Title)
              </Text>
              <TextField.Root
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：技术分享"
                required
                size="3"
              />
            </label>

            <label>
              <Text as="div" size="2" weight="bold" mb="2">
                描述（Description）
              </Text>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述"
                required
                size="3"
              />
            </label>
            <Flex justify="between" align="center">
              <Button onClick={() => setIsOpen(false)} variant="outline">取消</Button>
              <Button type="submit" disabled={loading} loading={loading}>
                创建
              </Button>
            </Flex>
            
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
