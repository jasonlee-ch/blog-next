import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyMessage } from 'viem';

const DEFAULT_WALLET_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2E4NTVmNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNncmFkKSIgLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2Utb3BhY2l0eT0iMC4zIiAvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjUiIC8+PC9zdmc+';

export async function POST(request: Request) {
  try {
    const { address, signature, message, ensName, ensAvatar } = await request.json();

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    // 1. 验证签名
    const valid = await verifyMessage({
      address,
      message,
      signature,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. 初始化 Supabase Admin 客户端 (需要 SERVICE_ROLE_KEY)
    const supabaseAdmin = await createClient();

    // 3. 查找或创建用户
    // 使用 "address@wallet.login" 作为唯一标识
    const email = `${address.toLowerCase()}@wallet.login`;
    // 生成一个随机密码用于本次会话交换
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
          // ⚠️ 注意: 可以学习一下该写法 
          ...(ensName && { name: ensName }),
          ...(ensAvatar && { avatar_url: ensAvatar }),
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
          name: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
          avatar_url: ensAvatar || DEFAULT_WALLET_AVATAR,
        },
      });
      if (createError) throw createError;
    }

    // 4. 使用临时密码登录获取 Session
    const { data: sessionData, error: loginError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password: tempPassword,
      });

    if (loginError) throw loginError;

    return NextResponse.json({ session: sessionData.session });
  } catch (error: any) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
