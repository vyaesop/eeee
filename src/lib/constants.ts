export const tiers = [
  {
    name: "Observer",
    minDeposit: 0,
    maxDeposit: 799,
    price: "Br 0",
    dailyReturn: 0,
  },
  {
    name: "Gold Assets 1",
    minDeposit: 800,
    maxDeposit: 1199,
    price: "Br 800",
    dailyReturn: 0.04,
  },
  {
    name: "Oil Assets 1",
    minDeposit: 1200,
    maxDeposit: 1499,
    price: "Br 1200",
    dailyReturn: 0.04,
  },
  {
    name: "Real Estate Assets 1",
    minDeposit: 1500,
    maxDeposit: 2699,
    price: "Br 1500",
    dailyReturn: 0.04,
  },
  {
    name: "Total Assets 1",
    minDeposit: 2700,
    maxDeposit: 2999,
    price: "Br 2700",
    dailyReturn: 0.04,
  },
  {
    name: "Gold Assets 2",
    minDeposit: 3000,
    maxDeposit: 3199,
    price: "Br 3000",
    dailyReturn: 0.045,
  },
  {
    name: "Oil Assets 2",
    minDeposit: 3200,
    maxDeposit: 3999,
    price: "Br 3200",
    dailyReturn: 0.045,
  },
  {
    name: "Real Estate Assets 2",
    minDeposit: 4000,
    maxDeposit: 5599,
    price: "Br 4000",
    dailyReturn: 0.045,
  },
  {
    name: "Total Assets 2",
    minDeposit: 5600,
    maxDeposit: 11999,
    price: "Br 5600",
    dailyReturn: 0.05,
  },
  {
    name: "All Invest",
    minDeposit: 12000,
    maxDeposit: Infinity,
    price: "Br 12000",
    dailyReturn: 0.05,
  },
];

export const getTierFromDeposit = (deposit: number): string => {
  const tier = tiers.find(t => deposit >= t.minDeposit && deposit <= t.maxDeposit);
  return tier ? tier.name : "Observer";
};