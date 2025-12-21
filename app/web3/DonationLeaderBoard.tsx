"use client";

import { useEffect, useState } from 'react';
import { Donation } from '@/types/donation';
import { BeggingContractConfig } from '@/web3/contract-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatEther, parseEther, isAddress } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Avatar, Box, Button, Card, Dialog, Flex, Text, TextField, Callout } from '@radix-ui/themes';

// 获取并处理捐赠数据
async function getDonationData(): Promise<Donation<string>[]> {
  // 请求我们在服务器上创建的 API 路由
  const response = await fetch('/web3/donation/list');

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.donations;
}

// 排行榜组件
export default function DonationLeaderboard() {
  const [amount, setAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: hash, isPending, mutate, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      // 关闭弹窗并清空输入
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(false);
      setAmount('');
    }
  }, [isConfirmed]);

  function handleDonateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    mutate({
      address: BeggingContractConfig.address,
      abi: BeggingContractConfig.abi,
      functionName: 'donate',
      value: parseEther(amount),
    });
  }

  const { data: donations, isLoading: isLeaderboardLoading, isError: isLeaderboardError } = useQuery({
    queryKey: ['donations'], // react-query 的缓存 key
    queryFn: getDonationData, // 获取数据的函数
  });

  if (isLeaderboardLoading) return <div className="text-center p-8">正在加载排行榜...</div>;
  if (isLeaderboardError) return <div className="text-center p-8 text-red-500">加载排行榜失败！</div>;

  return (
    <Card style={{ maxWidth: 500, width: '100%' }}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text size="5" weight="bold">爱心捐赠排行榜</Text>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger>
              <Button>我要捐赠</Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title>感谢您的爱心</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                请输入您希望捐赠的 ETH 数量。
              </Dialog.Description>

              <form onSubmit={handleDonateSubmit}>
                <Flex direction="column" gap="3">
                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      捐赠数量 (ETH)
                    </Text>
                    <TextField.Root
                      placeholder="例如: 0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      step="0.001"
                      min="0"
                    />
                  </label>

                  {error && (
                    <Callout.Root color="red" size="1">
                      <Callout.Text>
                        {error.message}
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      取消
                    </Button>
                  </Dialog.Close>
                  <Button
                    type="submit"
                    loading={isPending || isConfirming}
                    disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
                  >
                    {isPending ? '等待签名...' : isConfirming ? '交易确认中...' : '确认捐赠'}
                  </Button>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <Flex direction="column" gap="3">
          {donations && donations.length > 0 ? (
            donations.map((donation, index) => (
              <Flex key={donation.donor} gap="3" align="center">
                <Avatar
                  fallback={String(index + 1)}
                  size="2"
                  color={index < 3 ? 'amber' : 'gray'}
                  radius="full"
                />
                <Box flexGrow="1">
                  <Text as="div" size="2" weight="bold" trim="start">
                    {`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    好人一生平安
                  </Text>
                </Box>
                <Text size="2" weight="bold">
                  {/* 将字符串转回 BigInt 以便 formatEther 使用 */}
                  {Number(formatEther(BigInt(donation.totalAmount))).toFixed(4)} ETH
                </Text>
              </Flex>
            ))
          ) : (
            <Box py="4">
              <Text as="p" align="center" color="gray">
              还没有好心人捐赠，快来当第一个吧！
              </Text>
            </Box>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
