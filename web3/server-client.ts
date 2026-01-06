import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PROVIDERS } from './providers';

export const createServerViemClient = () => {
  return createPublicClient({
    chain: sepolia,
    transport: http(PROVIDERS.INFURA_SEPOLIA_URL),
  });
};
