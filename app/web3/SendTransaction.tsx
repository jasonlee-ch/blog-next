"use client";

import { Box, Button, Callout, Flex, Text, TextField } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { isAddress, parseEther } from 'viem';
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  type BaseError,
  useConnection,
} from 'wagmi';

export default function SendTransaction() {
  const { chain } = useConnection();
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');

  const {
    data: hash,
    isPending,
    sendTransaction,
    error,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });

  // 通用解决方案：使用 useEffect 监听状态变化并执行副作用
  useEffect(() => {
    if (isConfirmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTo('');
      setValue('');
    }
  }, [isConfirmed]); // 依赖项数组确保此 effect 仅在 isConfirmed 变化时运行

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAddress(to)) return; // 增加一个防御性检查
    sendTransaction({ to, value: parseEther(value) });
  }

  // 决定按钮是否应该被禁用
  // ⚠️ 注意: react19中不需要使用useMemo
  const isButtonDisabled =
    isPending || !to || !value || !isAddress(to) || isConfirming;

  return (
    <Flex direction="column" gap="4" maxWidth="500px" mx="auto" p="4">
      <form onSubmit={submit}>
        <Flex direction="column" gap="3">
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Recipient Address
            </Text>
            <TextField.Root
              name="address"
              placeholder="0xA0Cf…251e"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Amount (ETH)
            </Text>
            <TextField.Root
              name="value"
              placeholder="0.05"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Box>
          <Button disabled={isButtonDisabled} loading={isPending || isConfirming} type="submit" size="3">
            {isPending ? 'Waiting for signature...' : isConfirming ? 'Sending...' : 'Send Transaction'}
          </Button>
        </Flex>
      </form>

      {hash && (
        <Callout.Root>
          <Callout.Icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3.54999 4.45C3.74999 4.25 4.04999 4.25 4.24999 4.45L6.99999 7.2L9.74999 4.45C9.94999 4.25 10.25 4.25 10.45 4.45C10.65 4.65 10.65 4.95 10.45 5.15L7.69999 7.9L10.45 10.65C10.65 10.85 10.65 11.15 10.45 11.35C10.25 11.55 9.94999 11.55 9.74999 11.35L6.99999 8.6L4.24999 11.35C4.04999 11.55 3.74999 11.55 3.54999 11.35C3.34999 11.15 3.34999 10.85 3.54999 10.65L6.29999 7.9L3.54999 5.15C3.34999 4.95 3.34999 4.65 3.54999 4.45Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Callout.Icon>
          <Callout.Text>
            Transaction Hash:{' '}
            <a
              href={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {hash.slice(0, 6)}...{hash.slice(-4)}
            </a>
          </Callout.Text>
        </Callout.Root>
      )}

      {isConfirming && (
        <Callout.Root color="blue">
          <Callout.Text>Waiting for confirmation...</Callout.Text>
        </Callout.Root>
      )}

      {isConfirmed && (
        <Callout.Root color="green">
          <Callout.Text>Transaction confirmed successfully!</Callout.Text>
        </Callout.Root>
      )}

      {error && (
        <Callout.Root color="red">
          <Callout.Text>
            Error: {(error as BaseError).shortMessage || error.message}
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
