import { Flex, Spinner, Text } from '@radix-ui/themes';

type LoadingProps = {
  text?: string;
  className?: string; // 自定义样式类名
}

// 默认Props配置（可选属性的默认值）
const defaultProps: Pick<LoadingProps, 'className' | 'text'> = {
  text: '加载中...',
  className: '',
};


function Loading({ text }: LoadingProps) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ gridColumn: '1 / -1', minHeight: '200px' }}
    >
      <Flex direction="column" align="center" gap="3">
        <Spinner size="3" />
        <Text color="gray">{ text }</Text>
      </Flex>
    </Flex>
  );
}

Loading.defaultProps = defaultProps;

// 导出组件（支持默认导出+命名导出）
export default Loading;
export type { LoadingProps };

