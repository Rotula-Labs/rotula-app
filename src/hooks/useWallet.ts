import { useAsyncData } from "./useAsyncData";

export interface WalletData {
  balance: number;
  currency: string;
  trendPercentage: number;
}

const fetchWallet = async (): Promise<WalletData> => {
  // Simulate API call scoped to user
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    balance: 12450.0,
    currency: "USDC",
    trendPercentage: 2.4,
  };
};

export const useWallet = () =>
  useAsyncData<WalletData>(fetchWallet, "Failed to fetch wallet data");
