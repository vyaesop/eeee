
export const tiers = [
  {
    name: "Observer",
    minDeposit: 0,
    maxDeposit: 0,
    dailyReturn: 0,
    color: "#9ca3af",
    apy: 0,
  },
  {
    name: "Gold assets 1",
    minDeposit: 800,
    maxDeposit: 800,
    dailyReturn: 0.04,
    color: "#fde047",
    apy: Math.pow(1 + 0.04, 365) - 1,
  },
  {
    name: "Oil assets 1",
    minDeposit: 1200,
    maxDeposit: 1200,
    dailyReturn: 0.04,
    color: "#a16207",
    apy: Math.pow(1 + 0.04, 365) - 1,
  },
  {
    name: "Real estate assets 1",
    minDeposit: 1500,
    maxDeposit: 1500,
    dailyReturn: 0.04,
    color: "#f97316",
    apy: Math.pow(1 + 0.04, 365) - 1,
  },
  {
    name: "Total assets 1",
    minDeposit: 2700,
    maxDeposit: 2700,
    dailyReturn: 0.04,
    color: "#ea580c",
    apy: Math.pow(1 + 0.04, 365) - 1,
  },
  {
    name: "Gold asset 2",
    minDeposit: 3000,
    maxDeposit: 3000,
    dailyReturn: 0.045,
    color: "#facc15",
    apy: Math.pow(1 + 0.045, 365) - 1,
  },
  {
    name: "Oil asset 2",
    minDeposit: 3200,
    maxDeposit: 3200,
    dailyReturn: 0.045,
    color: "#854d0e",
    apy: Math.pow(1 + 0.045, 365) - 1,
  },
  {
    name: "Real estate asset 2",
    minDeposit: 4000,
    maxDeposit: 4000,
    dailyReturn: 0.045,
    color: "#d97706",
    apy: Math.pow(1 + 0.045, 365) - 1,
  },
  {
    name: "Total assets 2",
    minDeposit: 5600,
    maxDeposit: 5600,
    dailyReturn: 0.05,
    color: "#b45309",
    apy: Math.pow(1 + 0.05, 365) - 1,
  },
  {
    name: "All invest",
    minDeposit: 12000,
    maxDeposit: 12000,
    dailyReturn: 0.05,
    color: "#78350f",
    apy: Math.pow(1 + 0.05, 365) - 1,
  },
];

export function getTierFromDeposit(deposit: number) {
  if (deposit === 0) return "Observer";
  // Find the closest matching tier for a given deposit, in case of discrepancies.
  const closestTier = tiers.reduce((prev, curr) => {
    return (Math.abs(curr.minDeposit - deposit) < Math.abs(prev.minDeposit - deposit) ? curr : prev);
  });
  return closestTier.name;
}
