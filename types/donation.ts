// 捐赠人和捐赠总额
export type Donation<T> = {
  donor: `0x${string}`;
  totalAmount: T;
};