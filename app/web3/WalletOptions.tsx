"use client";

import { Button, Flex, Text } from '@radix-ui/themes'
import { useState, useEffect} from 'react'
import { Connector, useConnect, useConnectors } from 'wagmi'
export default function WalletOptions() {
  const { connect } = useConnect()
  const connectors = useConnectors()

  return (
    <Flex direction="column" gap="3" align="stretch">
      <Text size="3" weight="bold">Connect Wallet</Text>
      {connectors.map((connector) => (
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={() => connect({ connector })}
        />
      ))}
    </Flex>
  )
}


function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 检查当前环境是否存在该钱包的provider，存在才可以连接
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <Button disabled={!ready} onClick={onClick} size="3">
      {connector.name}
    </Button>
  )
}