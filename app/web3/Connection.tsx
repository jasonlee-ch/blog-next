"use client";

import { Avatar, Box, Button, Card, Flex, Text } from '@radix-ui/themes';
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

export default function Connection() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName!,
  });

  return (
    <Card>
      <Flex gap="4" align="center">
        <Avatar
          size="3"
          src={ensAvatar ?? undefined}
          fallback={address ? address.slice(0, 2) : '?'}
          radius="full"
        />
        <Box>
          <Text as="div" size="2" weight="bold">
            {ensName ? ensName : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </Text>
          <Text as="div" size="2" color="gray">
            {ensName ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connected'}
          </Text>
        </Box>
        <Flex gap="1" justify="end">
          <Button
            onClick={() => disconnect()}
            variant="soft"
            color="gray"
          >
            Disconnect
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
