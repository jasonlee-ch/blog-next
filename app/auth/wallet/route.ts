import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseSiweMessage, validateSiweMessage } from 'viem/siwe';
import { nonceStore } from '@/app/auth/nonce/route';
import { createServerViemClient } from '@/web3/server-client';

const DEFAULT_WALLET_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2E4NTVmNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNncmFkKSIgLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2Utb3BhY2l0eT0iMC4zIiAvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjUiIC8+PC9zdmc+';

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    // 1. 解析 SIWE 消息
    const siweMessage = parseSiweMessage(message);
    const { address, nonce } = siweMessage;

    if (!address || !nonce) {
      return NextResponse.json(
        { error: 'Invalid SIWE message' },
        { status: 400 }
      );
    }

    // 2. 验证 nonce 是否存在且未过期
    const storedNonce = nonceStore.get(nonce);
    if (!storedNonce || storedNonce.expiresAt < Date.now()) {
      nonceStore.delete(nonce);
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // 使用后立即删除 nonce（一次性使用）
    nonceStore.delete(nonce);

    // 3. 验证 SIWE 签名
    const valid = await validateSiweMessage({
      message: siweMessage,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid SIWE message format' }, { status: 401 });
    }

    const publicClient = createServerViemClient();

    // 验证签名是否来自声明的地址
    const verified = await publicClient.verifySiweMessage({
      message,
      signature: signature as `0x${string}`,
    });

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. 初始化 Supabase Admin 客户端
    const supabaseAdmin = await createClient();

    // 5. 查找或创建用户
    const email = `${address.toLowerCase()}@wallet.login`;
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    // 检查用户是否存在
    const {
      data: { users },
    } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      // 更新密码以便我们可以登录
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: {
          wallet_address: address,
        },
      });
    } else {
      // 创建新用户
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: address,
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          avatar_url: DEFAULT_WALLET_AVATAR,
        },
      });
      if (createError) throw createError;
    }

    // 6. 使用临时密码登录获取 Session
    const { data: sessionData, error: loginError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password: tempPassword,
      });

    console.log('sessionData', sessionData);

    if (loginError) throw loginError;

    return NextResponse.json({ session: sessionData.session });
  } catch (error) {
    console.error('Wallet auth error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
