"use client";

// eslint-disable-next-line @next/next/no-async-client-component
// export default async function Web3Page() {
//   const client = createPublicClient({
//     chain: mainnet,
//     transport: http(),
//   });
//   const block = await client.getBlock()


//   return (
//     <ClientComponent 
//       blockNumber={block.number.toString()}
//     />
//   )
// }

import { useAccount } from "wagmi";
import Connection from "./Connection";
import WalletOptions from "./WalletOptions";
import SendTransaction from "./SendTransaction";
import DonationLeaderboard from "./DonationLeaderBoard";
function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Connection />;
  return <WalletOptions />;
} 

export default function App() {
  return (
    // <ConnectWallet />
    // <SendTransaction />
    <DonationLeaderboard />
  )
}


// // 客户端组件
// function ClientComponent({ blockNumber }: { blockNumber: string }) {
//   return <div>Current Block: {blockNumber}</div>
// }