export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
}

export interface BankRecord {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}
