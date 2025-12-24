'use client';

import { useState } from 'react';
import { TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Category } from '@/types';
import CreateCategory from './create-category';
import CategoryCard from './category-card';

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLocaleLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <TextField.Root
          placeholder="输入分类/描述"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <CreateCategory
          onCreateSuc={(cate) => setCategories([...categories, cate])}
        >
          {/* <CategoryCard></CategoryCard> */}
        </CreateCategory>
        {filteredCategories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </>
  );
}
