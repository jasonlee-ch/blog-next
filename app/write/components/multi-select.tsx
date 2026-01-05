import React from 'react';
import { DropdownMenu, Button, Badge, Flex, Text } from '@radix-ui/themes';
import { ChevronDownIcon, Cross2Icon } from '@radix-ui/react-icons';

// 定义选项的类型
export interface SelectOption {
  label: string;
  value: string;
}

// 定义组件的 Props
interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "请选择...",
}: MultiSelectProps) => {
  
  // 处理选中/取消选中的逻辑
  const handleSelect = (itemValue: string) => {
    const newValue = value.includes(itemValue)
      ? value.filter((v) => v !== itemValue)
      : [...value, itemValue];
    onChange(newValue);
  };

  // 清除所有选中项
  const handleClear = (e: React.MouseEvent) => {
    // TODO-LJJ: 修复清除无法点击问题 
    e.stopPropagation(); // 防止触发 DropdownMenu 
    onChange([]);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button 
          variant="outline" 
          color="gray"
          size="3"
          style={{ 
            minWidth: 240, 
            cursor: 'pointer',
            justifyContent: 'space-between' 
          }}
        >
          <Flex gap="2" wrap="nowrap" align="center" style={{ overflow: 'hidden' }}>
            {value.length === 0 ? (
              <Text color="gray" size="2">{placeholder}</Text>
            ) : (
              <Flex gap="1">
                {value.map((val) => {
                  const option = options.find((opt) => opt.value === val);
                  return (
                    <Badge key={val} variant="soft" radius="medium">
                      {option?.label || val}
                    </Badge>
                  );
                })}
              </Flex>
            )}
          </Flex>
          
          <Flex align="center" gap="2" ml="2">
            {value.length > 0 && (
              <Cross2Icon 
                onClick={handleClear} 
                style={{ cursor: 'pointer', opacity: 0.5 }} 
              />
            )}
            <ChevronDownIcon />
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content variant="soft" style={{ minWidth: 240 }}>
        {options.map((option) => (
          <DropdownMenu.CheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            // 阻止默认行为以保持下拉框开启
            onSelect={(e) => {
              e.preventDefault();
              handleSelect(option.value);
            }}
          >
            {option.label}
          </DropdownMenu.CheckboxItem>
        ))}

        {value.length > 0 && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" onClick={() => onChange([])}>
              清除全部
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};