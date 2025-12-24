export type Category = {
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
};

export type UserProfile = {
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone
};

export type Post = {
  title: string; // 标题
  slug: string; // slug用于索引当前blog
  content: string; // 文章内容，markdown形式
  excerpt?: string | null; //
  author_id: string;
  published: boolean | null;
  created_at: string | null; // timestamp with time zone
  updated_at: string | null; // timestamp with time zone
  is_public: boolean | null;
};
