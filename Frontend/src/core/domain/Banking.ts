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

export interface BankResult {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export interface ApplyResult {
  cb_before: number;
  applied: number;
  cb_after: number;
}

export interface AdjustedCB {
  shipId: string;
  year: number;
  cbBefore: number;
  appliedBanked: number;
  adjustedCb: number;
}
