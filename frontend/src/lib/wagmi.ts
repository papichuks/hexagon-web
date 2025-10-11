import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";

export const hederaTestnet = {
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.hashio.io/api"] },
    public: { http: ["https://testnet.hashio.io/api"] },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet" },
  },
} as const;

export const config = getDefaultConfig({
  appName: "Hexagon",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http(hederaTestnet.rpcUrls.default.http[0]),
  },
  ssr: true,
});

