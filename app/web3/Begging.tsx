import { BeggingContractConfig } from "@/web3/contract-config";
import { useState } from "react";
import { isAddress, type Address } from "viem";
import { useReadContract } from "wagmi";

export default function Begging() {

  const [address, setAddress] = useState<Address>('0x');


  const { 
    data: donation,
    error,
    isPending
   } = useReadContract({
    ...BeggingContractConfig,
    functionName: 'getDonation',
    args: [address],
    query: {
      enabled: !!address && isAddress(address),
    }
  });
}