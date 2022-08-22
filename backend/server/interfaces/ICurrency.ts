export interface ICurrency {
  name: string;
  symbol: string;
  icon?: string;
  address: string;
  decimals: number;
  chainId: string;
  priceId?: string;
}