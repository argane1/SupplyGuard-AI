/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Shield, 
  LayoutDashboard, 
  Globe, 
  FolderSearch, 
  Lock, 
  Cpu, 
  BadgeCent, 
  Terminal,
  ChevronRight
} from "lucide-react";
import { SecurityRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: SecurityRole;
  setCurrentRole: (role: SecurityRole) => void;
  criticalCount: number;
  mediumCount: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentRole, 
  setCurrentRole,
  criticalCount,
  mediumCount
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Operations Terminal", icon: LayoutDashboard, badge: criticalCount > 0 ? `${criticalCount} Critical` : null, badgeColor: "bg-red-950/80 text-red-400 border-red-800/60" },
    { id: "risk-map", label: "Vulnerability Map", icon: Globe, badge: "Live", badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" },
    { id: "profiles", label: "Intelligence Dossiers", icon: FolderSearch, badge: `${criticalCount + mediumCount + 3} Audited`, badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700" },
    { id: "security", label: "Cipher Crypt & logs", icon: Lock, badge: "AES-256", badgeColor: "bg-blue-950/80 text-blue-400 border-blue-800/60" },
    { id: "architecture", label: "Architecture & Schema", icon: Cpu },
    { id: "pricing", label: "Enterprise Subscription", icon: BadgeCent }
  ];

  const roles = [
    SecurityRole.RISK_ANALYST,
    SecurityRole.SUPPLY_CHAIN_DIRECTOR,
    SecurityRole.SECURITY_ADMIN
  ];

  return (
    <div className="w-68 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between h-full select-none" id="sidebar-container">
      {/* Brand & System Status */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-500 shadow-lg shadow-emerald-950/10" id="brand-logo">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-tight text-zinc-100 uppercase">SupplyGuard AI</h1>
            <p className="text-[10px] font-mono text-zinc-500">v4.8.2 // Enterprise Secure</p>
          </div>
        </div>

        {/* Security Tunnel Status Banner */}
        <div className="mt-4 p-2 bg-emerald-950/20 border border-emerald-900/40 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[9px] font-mono font-medium text-emerald-400 uppercase tracking-wider">Secure TLS 1.3 Link</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-500 bg-zinc-900 px-1 py-0.5 rounded">AES-256</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
        <p className="text-[10px] font-mono font-semibold text-zinc-500 px-2 pb-1 uppercase tracking-wider">Intelligence Operations</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-mono text-xs ${
                isActive 
                  ? "bg-zinc-900 border border-zinc-700/80 text-zinc-100 font-medium" 
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
              }`}
              id={`nav-${item.id}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-500" : "text-zinc-500"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge ? (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 border rounded-full font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Manager & User Profile */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30">
        <div className="space-y-2">
          <label className="text-[9px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">Security Clearance Role</label>
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as SecurityRole)}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              id="role-selector"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5 pt-3 border-t border-zinc-800/50">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-emerald-600 to-zinc-800 flex items-center justify-center text-zinc-100 font-mono text-xs font-bold border border-zinc-700">
            RA
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-zinc-200 truncate font-mono">rachidargane@gmail.com</p>
            <p className="text-[9px] font-mono text-emerald-400 font-medium tracking-wide">LEVEL 3 SECURED</p>
          </div>
        </div>
      </div>
    </div>
  );
}
