export interface IChain {
  chainId: string;
  name: string;
  rpc: Array<string>;
  testnet: boolean;
  slug: string;
  icon?: string;
}