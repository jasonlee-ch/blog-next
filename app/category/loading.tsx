import { Flex, Spinner } from '@radix-ui/themes';

export default function Loading() {
  return (
    <Flex align="center" flexGrow="1" gap="4">
      <Spinner size="3" />
    </Flex>
  );
}
