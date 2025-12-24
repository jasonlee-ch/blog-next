import { createClient } from "@/lib/supabase/server";
import CategoryList from "./components/category-list";
export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-5 px-4">
      <CategoryList initialCategories={categories || []} />
    </div>
  );
}