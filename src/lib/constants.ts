export type Tier = {
  name: "Observer" | "Silver" | "Gold" | "Platinum";
  minDeposit: number;
  maxDeposit: number;
  monthlyRate: number;
  apy: number;
  color: string;
};

// APY = (1 + monthly_rate)^12 - 1
export const TIERS: Record<string, Tier> = {
  OBSERVER: {
    name: "Observer",
    minDeposit: 0,
    maxDeposit: 999,
    monthlyRate: 0,
    apy: 0,
    color: "hsl(var(--muted-foreground))",
  },
  SILVER: {
    name: "Silver",
    minDeposit: 1000,
    maxDeposit: 9999.99,
    monthlyRate: 0.04,
    apy: 0.601, // (1.04^12 - 1)
    color: "#C0C0C0",
  },
  GOLD: {
    name: "Gold",
    minDeposit: 10000,
    maxDeposit: 49999.99,
    monthlyRate: 0.065,
    apy: 1.129, // (1.065^12 - 1)
    color: "#FFD700",
  },
  PLATINUM: {
    name: "Platinum",
    minDeposit: 50000,
    maxDeposit: Infinity,
    monthlyRate: 0.09,
    apy: 1.815, // (1.09^12 - 1)
    color: "#E5E4E2",
  },
};

export const getTier = (deposit: number): Tier => {
  if (deposit >= TIERS.PLATINUM.minDeposit) return TIERS.PLATINUM;
  if (deposit >= TIERS.GOLD.minDeposit) return TIERS.GOLD;
  if (deposit >= TIERS.SILVER.minDeposit) return TIERS.SILVER;
  return TIERS.OBSERVER;
};

export const MOCK_REFERRALS = [
    { name: "alex.p", deposit: 5000 },
    { name: "sara.k", deposit: 12000 },
    { name: "mike.r", deposit: 2500 },
];
