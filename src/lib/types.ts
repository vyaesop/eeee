
export interface UserData {
  username: string;
  totalDeposit: number;
  earningsBalance: number;
  autoCompounding: boolean;
  joined: string;
  referredBy: string | null;
  referralCode: string;
  membershipTier: string;
  lastEarningsUpdate: string;
}
