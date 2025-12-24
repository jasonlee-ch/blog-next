"use client";

import { Category } from '@/types';
export default function CategoryCard({
  category,
}: {
  category: Category; // 不传时为新增
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
      <h3 className="font-bold text-lg mb-2 text-gray-900">
        {category.name}
      </h3>
      <p className="text-gray-600 text-sm line-clamp-3">
        {category.description || '暂无描述'}
      </p>
     </div>
  );
}
