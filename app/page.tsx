'use client';

import { useEffect, useState } from 'react';
import {
  Flex,
  Heading,
  Text,
  Grid,
  Card,
  Badge,
  TextField,
  Select,
  Box,
} from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { getSupabaseClient } from '../lib/supabase/client';
import type { Post, Category, PostWithCategories } from '../types';
import { useRouter } from 'next/navigation';
import Loading from './loading';


export default function Home() {
  const [posts, setPosts] = useState<PostWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();

      // 1. Fetch all categories for the filter
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }

      // 2. Fetch published posts with their categories
      const { data: postsData } = await supabase
        .from('posts')
        .select(
          `
          *,
          post_categories (
            categories (*)
          )
        `
        )
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (postsData) {
        // Flatten the nested join structure
        const formattedPosts = postsData.map((post: any) => ({
          ...post,
          categories: post.post_categories
            ? post.post_categories.map((pc: any) => pc.categories)
            : [],
        }));
        setPosts(formattedPosts);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt &&
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' ||
      post.categories.some((cat) => cat.slug === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // 跳转详情页
  const openDetail = (post: Post) => {
    router.push(`/posts/${post.slug}`);
  };

  return (
    <Flex direction="column" gap="6">
      <Flex gap="4" wrap="wrap">
        <Box width="160px">
          <Select.Root
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <Select.Trigger placeholder="Filter by category" />
            <Select.Content>
              <Select.Item value="all">全部标签</Select.Item>
              {categories.map((cat) => (
                <Select.Item key={cat.id} value={cat.slug}>
                  {cat.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Box flexGrow="1" maxWidth="400px">
          <TextField.Root
            placeholder="标题 / 摘要"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      </Flex>

      {loading && <Loading />}

      {/* Blog Cards Grid */}
      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
        

        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            size="2"
            className="cursor-pointer"
            onClick={() => openDetail(post)}
          >
            <Flex direction="column" gap="3" height="100%">
              <Heading size="4">{post.title}</Heading>

              <Flex gap="2" wrap="wrap">
                {post.categories.map((cat) => (
                  <Badge key={cat.id} color="indigo" variant="soft">
                    {cat.name}
                  </Badge>
                ))}
              </Flex>

              <Text as="p" size="2" color="gray" style={{ flexGrow: 1 }}>
                {post.excerpt || 'No excerpt available.'}
              </Text>

              <Text size="1" color="gray">
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString()
                  : ''}
              </Text>
            </Flex>
          </Card>
        ))}
        {!loading && filteredPosts.length === 0 && (
          <Text color="gray">暂无匹配的文章</Text>
        )}
      </Grid>
    </Flex>
  );
}
