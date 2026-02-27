'use client';

import { useEffect, useState } from 'react';
import { Donation } from '@/types/donation';
import { BeggingContractConfig } from '@/web3/contract-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatEther, parseEther } from 'viem';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Text,
  TextField,
  Callout,
  ScrollArea,
  Badge,
} from '@radix-ui/themes';
import Loading from '@/components/loading';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useToast } from '@/providers/toast-provider';

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
  const { showToast } = useToast();

  const { isConnected } = useAccount();

  const { data: hash, isPending, writeContract, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      // 关闭弹窗并清空输入
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(false);
      setAmount('');
      showToast('感谢大佬的打赏🙇', 'success');
    }
  }, [isConfirmed]);

  function handleDonateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    writeContract({
      address: BeggingContractConfig.address,
      abi: BeggingContractConfig.abi,
      functionName: 'donate',
      value: parseEther(amount),
    });
  }

  const {
    data: donations,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
  } = useQuery({
    queryKey: ['donations'], // react-query 的缓存 key
    queryFn: getDonationData, // 获取数据的函数
  });

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Flex direction="column" gap="4" className="flex-1">
        <Flex
          justify="between"
          align="center"
          pb="2"
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <Text size="4" weight="bold">
            🏆 大佬榜
          </Text>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger>
              {isConnected ? (
                <Button size="2" variant="soft" color="ruby">
                  💰 我要打赏
                </Button>
              ) : (
                // ✨ 重点： 增加rainbowkit的选择器前缀[data-rk]，保证样式正确 
                <div data-rk>
                  <ConnectButton showBalance={false}/>
                </div>
              )}
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title>感谢打赏🙇</Dialog.Title>
              <form onSubmit={handleDonateSubmit}>
                <Flex direction="column" gap="3">
                  <label>
                    <TextField.Root
                      placeholder="请输入您希望打赏的 ETH 数量，例如: 0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      step="0.001"
                      min="0"
                    />
                  </label>

                  {error && (
                    <Callout.Root color="red" size="1">
                      <Callout.Text>{error.message}</Callout.Text>
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
                    disabled={
                      isPending ||
                      isConfirming ||
                      !amount ||
                      parseFloat(amount) <= 0
                    }
                  >
                    {isPending
                      ? '等待签名...'
                      : isConfirming
                      ? '交易确认中...'
                      : '确认捐赠'}
                  </Button>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        {isLeaderboardLoading ? (
          <Loading text="加载排行榜中..." />
        ) : isLeaderboardError ? (
          <div className="text-center p-8 text-red-500">加载排行榜失败！</div>
        ) : (
          <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
            <Flex direction="column" gap="2" pr="3">
              {donations && donations.length > 0 ? (
                donations.map((donation, index) => (
                  <Card key={donation.donor} variant="ghost">
                    <Flex gap="3" align="center">
                      <Avatar
                        fallback={String(index + 1)}
                        size="2"
                        color={
                          index === 0
                            ? 'amber'
                            : index === 1
                            ? 'gray'
                            : index === 2
                            ? 'bronze'
                            : 'indigo'
                        }
                        radius="full"
                        variant="soft"
                      />
                      <Box flexGrow="1">
                        <Text as="div" size="2" weight="bold" trim="start">
                          {`${donation.donor.slice(
                            0,
                            6
                          )}...${donation.donor.slice(-4)}`}
                        </Text>
                        <Text as="div" size="1" color="gray">
                          好人一生平安
                        </Text>
                      </Box>
                      <Badge color="green" variant="surface">
                        {/* 将字符串转回 BigInt 以便 formatEther 使用 */}
                        {Number(
                          formatEther(BigInt(donation.totalAmount))
                        ).toFixed(4)}{' '}
                        ETH
                      </Badge>
                    </Flex>
                  </Card>
                ))
              ) : (
                <Box py="6">
                  <Text as="p" align="center" color="gray" size="2">
                    还没有打赏打赏，快来当第一个吧！
                  </Text>
                </Box>
              )}
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </Card>
  );
}
