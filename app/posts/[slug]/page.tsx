import { getSupabaseClient } from '@/lib/supabase/client';
import type { PostWithCategories } from '@/types';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Badge, Flex } from '@radix-ui/themes';
import MarkdownPreview, {
  EMarkdownPreviewMode,
} from '@/components/markdown-preview-v2';

export const revalidate = 60; // 每分钟重新验证页面

async function getPostBySlug(slug: string) {
  const supabase = getSupabaseClient();

  // 首先获取文章
  const { data: post, error } = await supabase
    .from('posts')
    .select(
      `
          *,
          post_categories (
            categories (*)
          )
        `
    )
    .eq('slug', slug)
    .eq('published', true)
    .single(); //

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  // 获取作者信息
  // const { data: author, error: authorError } = await supabase
  //   .from('user_profiles')
  //   .select('*')
  //   .eq('id', post.author_id)
  //   .single();

  // if (authorError) {
  //   console.error('Error fetching author:', authorError);
  //   // 即使获取作者失败，我们仍然返回文章
  //   return post as Post;
  // }

  // 合并文章和作者信息
  return {
    ...post,
    categories: post.post_categories?.map((cate: any) => {
      return cate.categories;
    })
    // author,
  } as PostWithCategories;
}

async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const currentUser = await getCurrentUser();

  console.log('slug', slug);
  if (!post) {
    notFound();
  }

  // 如果文章不是公开的，并且用户未登录，则显示 404
  if (!post.is_public && !currentUser) {
    notFound();
  }

  // const author = post.author?.display_name || post.author?.username || "未知作者"

  // const author = post.author_id;
  return (
    <>
      <article className="max-w-5xl mx-auto">
        <header className="mb-2">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="text-muted-foreground flex items-center gap-2">
            {formatDate(post.created_at)}
            <Flex gap="2" wrap="wrap">
                {post.categories.map((cat) => (
                  <Badge key={cat.id} color="indigo" variant="soft">
                    {cat.name}
                  </Badge>
                ))}
              </Flex>
            {!post.is_public && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                私有文章
              </span>
            )}
          </div>
        </header>

        {/* <EnhancedContent content={post.content} /> */}
        <MarkdownPreview
          mode={EMarkdownPreviewMode.read}
          content={post.content}
        ></MarkdownPreview>

        {/* <CommentsSection postId={post.id} /> */}
      </article>
    </>
  );
}
