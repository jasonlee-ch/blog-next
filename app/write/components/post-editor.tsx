'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  TextArea,
  Button,
  Flex,
  Box,
  Text,
  Grid,
  Card,
} from '@radix-ui/themes';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Category } from '@/types';
import MarkdownRenderer from '@/components/markdown-preview-v2';
import rehypeSanitize from "rehype-sanitize";
import dynamic from "next/dynamic";
import { MultiSelect } from './multi-select';
import { useToast } from '@/providers/toast-provider';

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

export function PostEditor({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const cateOptions = useMemo(() => {
    return categories.map((cat: Category) => ({
    label: cat.name,
    value: cat.id,
  }));}, [categories]);


  const onMarkdownContentChange = (value?: string) => {
    setContent(value ?? '');
  };

  const handleSubmit = async () => {
    if (!title || !content || !categoryIds?.length) {
      alert('请填写标题、内容并选择分类');
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast('请先登录', 'info');
        router.push('/login')
      }

      // 1. 插入文章
      // 注意：slug 的生成通常由数据库触发器处理，或者在这里前端生成
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title,
          excerpt,
          content,
          author_id: user.id,
          published: true,
          // 假设数据库有触发器处理 slug，或者你可以引入 slugify 库在这里生成
        })
        .select()
        .single();

      if (postError) throw postError;

      // 2. 关联分类
      if (post) {
        const resList = await Promise.all(categoryIds.map(categoryId => {
          return supabase
          .from('post_categories')
          .insert({
            post_id: post.id,
            category_id: categoryId,
          });
        }))
        resList.forEach(({ error: categoryError}) => {
          if (categoryError) {
            console.error(categoryError);
          }
        })
      }
      showToast('发布成功', 'success');
      router.push('/'); // 跳转到文章列表或详情
      router.refresh();
    } catch (error: any) {
      console.error('发布失败:', error);
      showToast('发布失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="5">
      {/* 顶部信息栏：标题、分类、摘要 */}
      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <Flex direction="column" gap="3">
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              文章标题
            </Text>
            <TextField.Root
              size="3"
              placeholder="输入文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            ></TextField.Root>
          </Box>

          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              分类标签
            </Text>
            <Box>
              {/* TODO-LJJ: 修复样式问题 */}
              <MultiSelect options={cateOptions} value={categoryIds} onChange={setCategoryIds} placeholder='选择标签'></MultiSelect>
            </Box>
          </Box>
        </Flex>

        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            摘要 (Excerpt)
          </Text>
          <TextArea
            size="3"
            placeholder="简短的摘要描述..."
            style={{ height: '108px' }}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </Box>
      </Grid>

      {/* Markdown 编辑器与预览 */}
      <Box>
        <Text as="label" size="2" weight="bold" mb="2">
          内容编辑 (Markdown)
        </Text>
        <Grid
          columns={{ initial: '1', md: '2' }}
          gap="4"
          style={{ height: '600px' }}
        >
          {/* 编辑区 */}
          <Card
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              p="2"
              style={{
                backgroundColor: 'var(--gray-3)',
                borderBottom: '1px solid var(--gray-5)',
              }}
            >
              <Text size="1" weight="bold" color="gray">
                EDITOR
              </Text>
            </Box>
            {/* <textarea
              className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm bg-transparent"
              placeholder="在此输入 Markdown 内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className=''>
              
            </div> */}
            <div className="flex-1 w-full">
              <MDEditor
                value={content}
                onChange={onMarkdownContentChange}
                height="100%"
                preview="edit"
                visibleDragbar={false}
                extraCommands={[]}
                // 避免xss攻击
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
              />
            </div>
          </Card>

          {/* 预览区 */}
          <Card
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              p="2"
              style={{
                backgroundColor: 'var(--gray-3)',
                borderBottom: '1px solid var(--gray-5)',
              }}
            >
              <Text size="1" weight="bold" color="gray">
                PREVIEW
              </Text>
            </Box>
            <Box
              className="flex-1 p-4 overflow-auto prose prose-sm max-w-none dark:prose-invert"
            >
              {content ? (
                <MarkdownRenderer content={content}></MarkdownRenderer>
              ) : (
                <Text color="gray" size="2" style={{ fontStyle: 'italic' }}>
                  预览区域...
                </Text>
              )}
            </Box>
          </Card>
        </Grid>
      </Box>
      {/* 底部按钮 */}
      <Flex justify="end" gap="3" mt="4">
        <Button
          size="3"
          variant="soft"
          color="gray"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button size="3" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '发布中...' : '发布文章'}
        </Button>
      </Flex>
    </Flex>
  );
}
