import { Donation } from '@/types/donation';
import { BeggingContractConfig } from '@/web3/contract-config';
import { createServerViemClient } from '@/web3/server-client';

async function getDonationData(): Promise<Donation<bigint>[]> {
  const client = createServerViemClient();

  // 获取所有 Donation 事件
  const donationLogs = await client.getContractEvents({
    address: BeggingContractConfig.address,
    abi: BeggingContractConfig.abi,
    eventName: 'Donation',
    fromBlock: BigInt(0), // 从创世区块开始获取，确保获取所有事件
  });

  // 使用 Map 来聚合每个捐赠者的总金额
  const donations = new Map<`0x${string}`, bigint>();

  for (const log of donationLogs) {
    const { donor, amount } = log.args;
    if (donor && amount) {
      const currentTotal = donations.get(donor) || BigInt(0);
      donations.set(donor, currentTotal + amount);
    }
  }

  // 将 Map 转换为数组并排序
  const sortedDonations = Array.from(donations.entries())
    .map(([donor, totalAmount]) => ({ donor, totalAmount }))
    .sort((a, b) => {
      if (a.totalAmount > b.totalAmount) return -1;
      if (a.totalAmount < b.totalAmount) return 1;
      return 0;
    });

  return sortedDonations;
}

export async function GET() {
  try {
    const donations = (await getDonationData()).map((donation) => ({
      ...donation,
      totalAmount: donation.totalAmount.toString(),
    }));
    return Response.json({ donations });
  } catch (error) {
    console.warn('Error fetching donation data:', error);
    return Response.json({ error }, { status: 500 });
  }
}
