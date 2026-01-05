import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "./components/post-editor";

export default async function CreatePostPage() {
  const supabase = await createClient();
  
  // 获取分类用于下拉选择
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">撰写新文章</h1>
      <PostEditor categories={categories || []}  />
    </>
  );
}
