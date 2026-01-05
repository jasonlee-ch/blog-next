import { Flex, Spinner, Text } from "@radix-ui/themes";

export default function Loading() {
  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      gap="3"
      style={{ minHeight: "50vh", width: "100%" }}
    >
      <Spinner size="3" />
      <Text size="2" color="gray">
        加载中...
      </Text>
    </Flex>
  );
}