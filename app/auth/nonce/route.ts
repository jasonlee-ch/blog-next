import { NextResponse } from 'next/server';
import { generateSiweNonce } from 'viem/siwe';

// 存储 nonce（生产环境建议使用 Redis 等持久化方案）
// 这里使用内存 Map + 过期时间作为简单实现
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

// 清理过期 nonce
function cleanExpiredNonces() {
  const now = Date.now();
  for (const [key, value] of nonceStore) {
    if (value.expiresAt < now) {
      nonceStore.delete(key);
    }
  }
}

export async function GET() {
  cleanExpiredNonces();

  const nonce = generateSiweNonce();

  // nonce 有效期 5 分钟
  nonceStore.set(nonce, {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return new NextResponse(nonce, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

// 导出 nonceStore 供 verify 端点使用
export { nonceStore };
