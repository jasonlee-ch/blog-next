import { http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { PROVIDERS } from './providers';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// 方法一：
// export const config = createConfig({
//   // chains: [mainnet, sepolia],
//   chains: [sepolia],
//   // autoConnect: true, // 自动重连钱包
//   transports: {
//     // [mainnet.id]: http(PROVIDERS.INFURA_MAINNET),
//     [sepolia.id]: http(PROVIDERS.INFURA_SEPOLIA_URL),
//   },
//   // connectors: [
//   //   injected(),
//   //   metaMask(),
//   // ],
// })

export const config = getDefaultConfig({
   appName: 'next-blog',
   projectId: '72fb972dd82a464f87a1cd1d97b7e79c',
   chains: [sepolia],
   transports: {
      [sepolia.id]: http(PROVIDERS.INFURA_SEPOLIA_URL),
   },
   ssr: true,
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