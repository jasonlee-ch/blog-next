import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { PROVIDERS } from './providers';
import { createClient } from 'viem'
import { metaMask, injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// 方法一：
export const config = createConfig({
  // chains: [mainnet, sepolia],
  chains: [sepolia],
  transports: {
    // [mainnet.id]: http(PROVIDERS.INFURA_MAINNET),
    [sepolia.id]: http(PROVIDERS.INFURA_SEPOLIA_URL),
  },
  connectors: [
    injected(),
    metaMask(),
  ],
})

// 方法二：
// export const config1 = createConfig({
//   chains: [mainnet, sepolia],
//   client({ chain }) {
//     switch (chain.id) {
//       case mainnet.id:
//         return createClient({ chain, transport: http(PROVIDERS.INFURA_MAINNET) })
//       case sepolia.id:
//         return createClient({ chain, transport: http(PROVIDERS.INFURA_SEPOLIA_URL) })
//       default:
//         return createClient({ chain, transport: http() })
//     }
//   }
// });