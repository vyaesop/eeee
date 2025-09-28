
export const tiers = [
  {
    name: "Observer",
    minDeposit: 0,
    maxDeposit: 799,
    dailyReturn: 0,
    color: "#9ca3af",
    apy: 0,
  },
  {
    name: "Gold assets 1",
    minDeposit: 800,
    maxDeposit: 1199,
    dailyReturn: 0.015,
    color: "#FFD700",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Oil assets 1",
    minDeposit: 1200,
    maxDeposit: 1499,
    dailyReturn: 0.015,
    color: "#FDB813",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Real estate assets 1",
    minDeposit: 1500,
    maxDeposit: 2699,
    dailyReturn: 0.015,
    color: "#EAC117",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Total assets 1",
    minDeposit: 2700,
    maxDeposit: 2999,
    dailyReturn: 0.015,
    color: "#DAA520",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Gold asset 2",
    minDeposit: 3000,
    maxDeposit: 3199,
    dailyReturn: 0.015,
    color: "#CD7F32",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Oil asset 2",
    minDeposit: 3200,
    maxDeposit: 3999,
    dailyReturn: 0.015,
    color: "#B87333",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Real estate asset 2",
    minDeposit: 4000,
    maxDeposit: 5599,
    dailyReturn: 0.015,
    color: "#C58917",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Total assets 2",
    minDeposit: 5600,
    maxDeposit: 11999,
    dailyReturn: 0.015,
    color: "#C19A6B",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "All invest",
    minDeposit: 12000,
    maxDeposit: 12999,
    dailyReturn: 0.015,
    color: "#AD6F69",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
  {
    name: "Large Scale Investment",
    minDeposit: 13000,
    maxDeposit: Number.POSITIVE_INFINITY,
    dailyReturn: 0.015,
    color: "#966F33",
    apy: Math.pow(1 + 0.015, 365) - 1,
  },
];

export function getTierFromDeposit(deposit: number) {
  const sortedTiers = [...tiers].sort((a, b) => b.minDeposit - a.minDeposit);
  const applicableTier = sortedTiers.find(tier => deposit >= tier.minDeposit);
  return applicableTier ? applicableTier.name : "Observer";
}
