import { getSupabaseClient } from "@/lib/supabase/client";
import CategoryList from "./components/category-list";
export default async function CategoriesPage() {
  const supabase = await getSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <CategoryList initialCategories={categories || []} />
  );
}