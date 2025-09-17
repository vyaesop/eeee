export type Tier = {
  name: string;
  minDeposit: number;
  maxDeposit: number;
  dailyReturn: number;
  apy: number;
  color: string;
};

export const TIERS: Record<string, Tier> = {
  OBSERVER: {
    name: 'Observer',
    minDeposit: 0,
    maxDeposit: 0,
    dailyReturn: 0,
    apy: 0,
    color: '#9ca3af', // gray-400
  },
  SILVER: {
    name: 'Silver',
    minDeposit: 1,
    maxDeposit: 9999,
    dailyReturn: 0.002,
    apy: Math.pow(1 + 0.002, 365) - 1,
    color: '#c0c0c0', // silver
  },
  GOLD: {
    name: 'Gold',
    minDeposit: 10000,
    maxDeposit: 49999,
    dailyReturn: 0.0025,
    apy: Math.pow(1 + 0.0025, 365) - 1,
    color: '#ffd700', // gold
  },
  PLATINUM: {
    name: 'Platinum',
    minDeposit: 50000,
    maxDeposit: Infinity,
    dailyReturn: 0.003,
    apy: Math.pow(1 + 0.003, 365) - 1,
    color: '#e5e4e2', // platinum
  },
};

export const tiers = Object.values(TIERS);

export const getTierFromDeposit = (deposit: number): string => {
  if (deposit >= TIERS.PLATINUM.minDeposit) {
    return TIERS.PLATINUM.name;
  }
  if (deposit >= TIERS.GOLD.minDeposit) {
    return TIERS.GOLD.name;
  }
  if (deposit >= TIERS.SILVER.minDeposit) {
    return TIERS.SILVER.name;
  }
  return TIERS.OBSERVER.name;
};
