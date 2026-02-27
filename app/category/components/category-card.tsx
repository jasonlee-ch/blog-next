"use client";
import { Text, Card } from '@radix-ui/themes';

import { Category } from '@/types';
export default function CategoryCard({
  category,
}: {
  category: Category; // 不传时为新增
}) {
  return (
    <Card className="rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <Text as="div" className="font-bold text-lg mb-2 ">
        {category.name}
      </Text>
      <Text className="text-sm line-clamp-3">
        {category.description || '暂无描述'}
      </Text>
     </Card>
  );
}
