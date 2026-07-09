/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  CRITICAL = "Critical",
}

export enum SupplierCategory {
  SEMICONDUCTORS = "Semiconductors",
  LOGISTICS = "Logistics",
  RAW_MATERIALS = "Raw Materials",
  ENERGY = "Energy",
  CHEMICALS = "Chemicals",
  HARDWARE = "Hardware",
  PACKAGING = "Packaging",
}

export enum SecurityRole {
  RISK_ANALYST = "Risk Analyst",
  SUPPLY_CHAIN_DIRECTOR = "Supply Chain Director",
  SECURITY_ADMIN = "Security Admin",
}

export interface RiskBreakdown {
  news: number;        // 0 to 100
  market: number;      // 0 to 100
  regulation: number;  // 0 to 100
  delivery: number;    // 0 to 100
  reputation: number;  // 0 to 100
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  lat: number;         // Lat/Lng for geographic mock positioning
  lng: number;
  riskScore: number;   // Calculated aggregate score, 0 to 100
  riskLevel: RiskLevel;
  category: SupplierCategory;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  revenue: string;
  coreProducts: string[];
  secureKeyId: string;
  secureKeyStatus: "Encrypted" | "Rotating" | "Active";
  lastAuditDate: string;
  description: string;
  riskBreakdown: RiskBreakdown;
  mitigations: string[];
}

export interface Alert {
  id: string;
  supplierId: string;
  supplierName: string;
  category: SupplierCategory;
  type: "Geopolitical" | "Delivery" | "Financial" | "Regulatory" | "Reputation";
  severity: "Low" | "Medium" | "High" | "Critical";
  message: string;
  date: string;
  status: "Active" | "Mitigating" | "Resolved";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: SecurityRole;
  action: string;
  type: "Security" | "Risk" | "Supplier" | "System";
  details: string;
}

export interface APIKey {
  id: string;
  keyHint: string;
  description: string;
  role: SecurityRole;
  createdAt: string;
  expiresAt: string;
  status: "Active" | "Revoked" | "Expired";
}

export interface SecurityStatus {
  aesKeyActive: boolean;
  aesKeyFingerprint: string;
  tlsVersion: string;
  lastRotated: string;
  databaseEncryptionStatus: "Full" | "Partial" | "Unsecured";
}
