/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  LayoutDashboard, 
  Globe, 
  FolderSearch, 
  Lock, 
  Cpu, 
  BadgeCent, 
  Terminal,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  RotateCw,
  Plus,
  Key,
  Database,
  Trash2,
  RefreshCw,
  MapPin,
  Clock,
  Eye,
  FileSpreadsheet,
  Download,
  AlertOctagon,
  LockKeyhole,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles
} from "lucide-react";
import { 
  Supplier, 
  RiskLevel, 
  SupplierCategory, 
  SecurityRole, 
  Alert, 
  AuditLog, 
  APIKey, 
  SecurityStatus 
} from "./types";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentRole, setCurrentRole] = useState<SecurityRole>(SecurityRole.RISK_ANALYST);
  
  // App States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterTier, setFilterTier] = useState<string>("All");
  
  // Forms States
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [newSupName, setNewSupName] = useState("");
  const [newSupCountry, setNewSupCountry] = useState("");
  const [newSupCategory, setNewSupCategory] = useState<SupplierCategory>(SupplierCategory.SEMICONDUCTORS);
  const [newSupTier, setNewSupTier] = useState<"Tier 1" | "Tier 2" | "Tier 3">("Tier 1");
  const [newSupRevenue, setNewSupRevenue] = useState("$250M");
  const [newSupProducts, setNewSupProducts] = useState("");
  const [newSupDescription, setNewSupDescription] = useState("");
  
  // API Key State
  const [newKeyDesc, setNewKeyDesc] = useState("");
  const [newKeyRole, setNewKeyRole] = useState<SecurityRole>(SecurityRole.RISK_ANALYST);
  
  // Custom Mitigation Input State
  const [newMitigation, setNewMitigation] = useState("");

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Dynamic news stream based on suppliers
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>([]);

  // Fetch all initial data
  const loadData = async () => {
    try {
      const supRes = await fetch("/api/suppliers");
      const supData = await supRes.json();
      setSuppliers(supData);
      if (supData.length > 0 && !selectedSupplier) {
        setSelectedSupplier(supData[2] || supData[0]); // default to logistics or first
      }

      const logRes = await fetch("/api/audit-logs");
      const logData = await logRes.json();
      setAuditLogs(logData);

      const keyRes = await fetch("/api/api-keys");
      const keyData = await keyRes.json();
      setApiKeys(keyData);

      const secRes = await fetch("/api/security-status");
      const secData = await secRes.json();
      setSecurityStatus(secData);
    } catch (err) {
      console.error("Error loading secure intelligence data:", err);
      showNotification("Secure socket initialization timed out. Sandbox parameters loaded.", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync simulated system alerts when suppliers load
  useEffect(() => {
    if (suppliers.length === 0) return;
    const initialAlerts: Alert[] = [
      {
        id: "al-1",
        supplierId: "sup-3",
        supplierName: "Pacific Maritime Logistics",
        category: SupplierCategory.LOGISTICS,
        type: "Delivery",
        severity: "Critical",
        message: "Maritime passage terminal congestion reaches 95% at Singapore Port Gates.",
        date: "2026-07-09",
        status: "Active"
      },
      {
        id: "al-2",
        supplierId: "sup-2",
        supplierName: "NeoLithium Battery Systems",
        category: SupplierCategory.RAW_MATERIALS,
        type: "Financial",
        severity: "Medium",
        message: "Lithium carbonate index volatility prompts defensive margin calls.",
        date: "2026-07-08",
        status: "Active"
      },
      {
        id: "al-3",
        supplierId: "sup-4",
        supplierName: "Apex ChemCorp",
        category: SupplierCategory.CHEMICALS,
        type: "Regulatory",
        severity: "Medium",
        message: "EU Commission updates photolithography solvent emission maximum allowances.",
        date: "2026-07-05",
        status: "Mitigating"
      }
    ];
    setSystemAlerts(initialAlerts);
  }, [suppliers]);

  const showNotification = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Helper logging actions to server audit logs
  const logActionOnServer = async (action: string, type: "Security" | "Risk" | "Supplier" | "System", details: string) => {
    try {
      const res = await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "rachidargane@gmail.com",
          role: currentRole,
          action,
          type,
          details
        })
      });
      if (res.ok) {
        const freshLogs = await (await fetch("/api/audit-logs")).json();
        setAuditLogs(freshLogs);
      }
    } catch (err) {
      console.error("Failed to append audit trace:", err);
    }
  };

  // 1. Perform Gemini AI Supply Chain Analysis
  const handleAiAnalysis = async (supplierId: string) => {
    setIsAnalyzing(supplierId);
    showNotification(`Querying Gemini 3.5 Flash for supplier ${supplierId}...`, "info");
    
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId })
      });
      const resData = await res.json();
      
      if (resData.success) {
        setAnalysisResult(resData.data);
        
        // Refresh local suppliers data
        await loadData();
        
        // Find updated supplier
        const updatedSup = suppliers.find(s => s.id === supplierId);
        
        // Append news alert if returned
        if (resData.data.simulatedNews && resData.data.simulatedNews.length > 0) {
          const freshAlerts: Alert[] = resData.data.simulatedNews.map((n: any) => ({
            id: n.id,
            supplierId,
            supplierName: updatedSup ? updatedSup.name : "Analyzed Supplier",
            category: updatedSup ? updatedSup.category : SupplierCategory.SEMICONDUCTORS,
            type: "Geopolitical",
            severity: n.severity,
            message: n.headline + ": " + n.message,
            date: n.date,
            status: "Active"
          }));
          setSystemAlerts(prev => [...freshAlerts, ...prev].slice(0, 10));
        }

        // Selected state sync
        const newlyFetchedSupRes = await fetch(`/api/suppliers/${supplierId}`);
        if (newlyFetchedSupRes.ok) {
          const fetchedSup = await newlyFetchedSupRes.json();
          setSelectedSupplier(fetchedSup);
        }

        const modelUsed = resData.isRealAi ? "Gemini Ultra-Intelligence Core" : "Sandbox Core";
        showNotification(`AI risk matrix calculation complete for ${updatedSup?.name}. Dynamic score adjusted.`, "success");
        await logActionOnServer(
          "AI Vulnerability Intelligence Query",
          "Risk",
          `Calculated threat vectors for ${updatedSup?.name || supplierId}. Strategy Engine: ${modelUsed}.`
        );
      } else {
        showNotification("Failed to finalize Gemini analysis output. Please verify config.", "error");
      }
    } catch (err: any) {
      showNotification("Cybernetic AI connection lost. Please try again.", "error");
    } finally {
      setIsAnalyzing(null);
    }
  };

  // 2. Rotate Master AES-256 Key (Requires Security Admin Role)
  const handleKeyRotation = async () => {
    if (currentRole !== SecurityRole.SECURITY_ADMIN) {
      showNotification("Access Denied: Master rotation requires Security Admin credentials.", "error");
      await logActionOnServer(
        "Unauthorized Key Rotation Attempt",
        "Security",
        "Block incident. User attempted to trigger master cipher rotation without clearance."
      );
      return;
    }

    try {
      const res = await fetch("/api/security-status/rotate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "rachidargane@gmail.com",
          role: currentRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setSecurityStatus(data.securityStatus);
        // Reload suppliers to show newly rotated key IDs
        await loadData();
        showNotification("Master AES-256 encryption vector successfully rotated.", "success");
      }
    } catch (err) {
      showNotification("Rotation handshake failed.", "error");
    }
  };

  // 3. Generate New External API Key (Requires Security Admin Role)
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== SecurityRole.SECURITY_ADMIN) {
      showNotification("Access Denied: Token issuing is reserved for Security Admins.", "error");
      return;
    }

    if (!newKeyDesc.trim()) {
      showNotification("Description cannot be empty.", "error");
      return;
    }

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newKeyDesc,
          role: newKeyRole,
          user: "rachidargane@gmail.com"
        })
      });
      if (res.ok) {
        await loadData();
        setNewKeyDesc("");
        showNotification("New API Access Token issued and encrypted.", "success");
      }
    } catch (err) {
      showNotification("Failed to issue API token.", "error");
    }
  };

  // 4. Revoke API Key
  const handleRevokeApiKey = async (id: string) => {
    if (currentRole !== SecurityRole.SECURITY_ADMIN) {
      showNotification("Access Denied: Token revocation requires Admin clearance.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/api-keys/${id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "rachidargane@gmail.com" })
      });
      if (res.ok) {
        await loadData();
        showNotification("Token revoked successfully.", "success");
      }
    } catch (err) {
      showNotification("Token revocation failed.", "error");
    }
  };

  // 5. Securely Provision New Supplier (Requires Supply Chain Director or Security Admin)
  const handleProvisionSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === SecurityRole.RISK_ANALYST) {
      showNotification("Access Denied: Analyst role cannot register new suppliers.", "error");
      return;
    }

    if (!newSupName.trim() || !newSupCountry.trim() || !newSupProducts.trim()) {
      showNotification("Please populate all vital identity fields.", "error");
      return;
    }

    try {
      // Mock latitude/longitude offset coordinates for map placement
      const latOffsets: { [key: string]: number } = { "USA": 37.09, "China": 35.86, "Taiwan": 23.69, "Japan": 36.20, "Germany": 51.16, "Vietnam": 14.05, "India": 20.59, "Mexico": 23.63 };
      const lngOffsets: { [key: string]: number } = { "USA": -95.71, "China": 104.19, "Taiwan": 120.96, "Japan": 138.25, "Germany": 10.45, "Vietnam": 108.27, "India": 78.96, "Mexico": -102.55 };

      const lat = latOffsets[newSupCountry] || (Math.random() * 40 + 10);
      const lng = lngOffsets[newSupCountry] || (Math.random() * 80 - 20);

      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupName,
          country: newSupCountry,
          lat,
          lng,
          category: newSupCategory,
          tier: newSupTier,
          revenue: newSupRevenue,
          coreProducts: newSupProducts.split(",").map(p => p.trim()),
          description: newSupDescription || "Independently audited supplier provisioned securely into platform infrastructure."
        })
      });

      if (res.ok) {
        const data = await res.json();
        await loadData();
        
        // Log action on system log
        await logActionOnServer(
          "Supplier Onboard Handshake",
          "Supplier",
          `Securely registered '${data.name}' with standard AES cipher '${data.secureKeyId}'.`
        );

        // Reset form
        setNewSupName("");
        setNewSupCountry("");
        setNewSupProducts("");
        setNewSupDescription("");
        setIsProvisioning(false);
        showNotification(`Supplier ${data.name} has been enrolled and fully encrypted.`, "success");
      }
    } catch (err) {
      showNotification("Supplier registration failed.", "error");
    }
  };

  // 6. Append Custom Safety Mitigation
  const handleAddMitigation = async () => {
    if (!selectedSupplier || !newMitigation.trim()) return;

    if (currentRole === SecurityRole.RISK_ANALYST) {
      showNotification("Insufficient clearance: Analysts cannot manually append mitigation protocols.", "error");
      return;
    }

    const updatedMitigations = [...selectedSupplier.mitigations, newMitigation.trim()];
    try {
      const res = await fetch(`/api/suppliers/${selectedSupplier.id}/mitigations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mitigations: updatedMitigations })
      });
      if (res.ok) {
        const updatedSupplier = await res.json();
        setSelectedSupplier(updatedSupplier);
        await loadData();
        setNewMitigation("");
        showNotification("Mitigation instruction added.", "success");
        await logActionOnServer(
          "Mitigation Protocol Enforced",
          "Risk",
          `Assigned new override safety buffer to supplier ${selectedSupplier.name}.`
        );
      }
    } catch (err) {
      showNotification("Failed to update mitigation strategy.", "error");
    }
  };

  // Computed Values
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.coreProducts.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "All" || s.category === filterCategory;
    const matchesTier = filterTier === "All" || s.tier === filterTier;
    return matchesSearch && matchesCategory && matchesTier;
  });

  const criticalCount = suppliers.filter(s => s.riskLevel === "Critical").length;
  const mediumCount = suppliers.filter(s => s.riskLevel === "Medium").length;
  
  // Calculate dynamic AI Sentiment Index
  const averageRisk = suppliers.length > 0 
    ? Math.round(suppliers.reduce((acc, s) => acc + s.riskScore, 0) / suppliers.length) 
    : 45;
  const aiSentimentIndex = 100 - averageRisk;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900" id="applet-viewport">
      {/* Sidebar Section */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole} 
        setCurrentRole={(r) => {
          setCurrentRole(r);
          showNotification(`Clearance adjusted: ${r}`, "info");
        }}
        criticalCount={criticalCount}
        mediumCount={mediumCount}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden" id="main-content-window">
        {/* Persistent Alert Banner & Toast */}
        {notification && (
          <div className="absolute top-4 right-6 z-50 animate-bounce" id="toast-notification">
            <div className={`px-4 py-3 rounded-lg shadow-xl border text-xs font-mono flex items-center gap-2 ${
              notification.type === "success" 
                ? "bg-emerald-900 border-emerald-700 text-emerald-100" 
                : notification.type === "error" 
                ? "bg-rose-900 border-rose-700 text-rose-100" 
                : "bg-slate-900 border-slate-700 text-slate-100"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>{notification.text}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0" id="global-header">
          <div className="flex items-center space-x-4">
            <h1 className="text-base font-semibold tracking-tight text-slate-900 font-sans uppercase">
              {activeTab === "dashboard" && "Operations Terminal"}
              {activeTab === "risk-map" && "Geopolitical Threat Heat Map"}
              {activeTab === "profiles" && "Supplier Dossiers"}
              {activeTab === "security" && "Cipher Crypt & logs"}
              {activeTab === "architecture" && "System Architecture"}
              {activeTab === "pricing" && "Enterprise Subscription"}
            </h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              System Pulse: Stable
            </span>
          </div>
          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center font-mono">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              {securityStatus?.tlsVersion || "TLS 1.3"} Active
            </div>
            <div className="flex items-center font-mono">
              API Security: <span className="text-emerald-600 font-semibold ml-1">Healthy</span>
            </div>
            <button 
              onClick={() => {
                showNotification("Generating cryptographically signed report PDF...", "info");
                setTimeout(() => showNotification("Secure report generated. Download queued in enterprise hub.", "success"), 1500);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-all rounded text-slate-900 font-medium text-[11px] border border-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Export Report
            </button>
          </div>
        </header>

        {/* Global Overview Row (Metrics) */}
        <div className="p-6 pb-0 shrink-0" id="metrics-bar">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Covered Supply Nodes</p>
              <h2 className="text-2xl font-bold mt-1 text-slate-800">{suppliers.length} Active</h2>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 uppercase font-mono tracking-tight flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                100% Secure Telemetry Coverage
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider text-rose-500">Critical Risks Identified</p>
              <h2 className="text-2xl font-bold mt-1 text-rose-600">{criticalCount} Flagged</h2>
              <div className="text-[10px] text-rose-500 font-semibold mt-1 uppercase font-mono tracking-tight flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 animate-pulse" />
                Requires Immediate Re-Routing
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">AI Resilience Sentiment</p>
              <h2 className="text-2xl font-bold mt-1 text-indigo-600">{aiSentimentIndex}% Resilience</h2>
              <div className="text-[10px] text-indigo-600 font-semibold mt-1 uppercase font-mono tracking-tight flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Calculated on global news trends
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider text-emerald-600">Compliance Rating</p>
              <h2 className="text-2xl font-bold mt-1 text-emerald-600">99.8% Certified</h2>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 uppercase font-mono tracking-tight flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ISO 27001 & TISAX Audited
              </div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6" id="main-scroll-view">
          
          {/* TAB 1: OPERATIONS TERMINAL (DASHBOARD) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6" id="dashboard-tab">
              {/* Middle Section: Global SVG Map & AI Advice Card */}
              <div className="grid grid-cols-5 gap-6">
                
                {/* Custom Interactive SVG Heatmap */}
                <div className="col-span-3 bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">Dynamic Risk Heat Map</h3>
                      <p className="text-[10px] text-slate-500">Global coordinate supplier beacons. Click a node to inspect dossier.</p>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Critical
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Medium
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Low
                      </span>
                    </div>
                  </div>

                  {/* Interactive SVG World Vector Canvas Map representation */}
                  <div className="flex-1 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 relative overflow-hidden p-2">
                    {/* Abstract world map lines styling */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,#4f46e5_1.5px,transparent_1.5px),radial-gradient(circle_at_60%_80%,#e11d48_1.5px,transparent_1.5px)] bg-[length:24px_24px]"></div>
                    
                    <svg viewBox="0 0 1000 450" className="w-full h-full text-slate-700/30" stroke="currentColor" fill="none">
                      {/* Stylized simplified continental paths */}
                      <path d="M150,120 Q180,90 260,100 T350,150 T400,220 Q410,260 380,310 T300,380 T200,320 T150,120 Z" fill="rgba(30, 41, 59, 0.3)" strokeWidth="1" strokeDasharray="3,3" />
                      <path d="M480,100 Q560,70 650,90 T750,140 T820,220 Q840,280 800,340 T680,370 T550,300 T480,100 Z" fill="rgba(30, 41, 59, 0.3)" strokeWidth="1" strokeDasharray="3,3" />
                      <path d="M220,180 Q250,160 280,220 T240,300 Z" fill="rgba(30, 41, 59, 0.3)" />
                      {/* Equator & Grid overlays */}
                      <line x1="0" y1="225" x2="1000" y2="225" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
                      <line x1="500" y1="0" x2="500" y2="450" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
                      
                      {/* Plot suppliers as interactive glowing dots */}
                      {suppliers.map((s) => {
                        // Project lat/lng to simplified SVG view space:
                        // Lat range ~ -60 to 80 -> Y range ~ 400 to 50
                        // Lng range ~ -150 to 180 -> X range ~ 100 to 900
                        const x = 500 + (s.lng * 2.2);
                        const y = 225 - (s.lat * 2.4);

                        const isSelected = selectedSupplier?.id === s.id;
                        const isCritical = s.riskLevel === "Critical";
                        const isMedium = s.riskLevel === "Medium";
                        const colorClass = isCritical ? "fill-rose-500 text-rose-500" : isMedium ? "fill-amber-500 text-amber-500" : "fill-emerald-500 text-emerald-500";
                        const pingClass = isCritical ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";

                        return (
                          <g key={s.id} className="cursor-pointer group" onClick={() => setSelectedSupplier(s)}>
                            {/* Halo */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 14 : 7} 
                              className={`stroke-current ${colorClass} opacity-20`} 
                              strokeWidth="1.5"
                            />
                            {/* Inner Beacon */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 6 : 4} 
                              className={`${colorClass}`} 
                            />
                            {/* Dynamic Text Label on Hover */}
                            <text 
                              x={x + 10} 
                              y={y + 4} 
                              className="fill-zinc-400 font-mono text-[9px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                              fontWeight="bold"
                            >
                              {s.name} ({s.riskScore})
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Miniature Float Panel details for currently mapped node */}
                    {selectedSupplier && (
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-slate-800 rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold uppercase">{selectedSupplier.tier}</span>
                            <span className="text-zinc-500">|</span>
                            <span className="text-zinc-100 font-semibold">{selectedSupplier.name}</span>
                            <span className="text-zinc-500">({selectedSupplier.country})</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{selectedSupplier.description}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedSupplier.riskLevel === "Critical" ? "bg-rose-950/60 text-rose-400" :
                            selectedSupplier.riskLevel === "Medium" ? "bg-amber-950/60 text-amber-400" :
                            "bg-emerald-950/60 text-emerald-400"
                          }`}>
                            Risk Score: {selectedSupplier.riskScore}
                          </span>
                          <button 
                            onClick={() => setActiveTab("profiles")}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[10px] rounded uppercase tracking-wider"
                          >
                            Inspect Dossier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar AI Advice Panel */}
                <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-md p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                      <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center">
                        <Sparkles className="w-4 h-4 text-indigo-400 mr-2 animate-pulse" />
                        AI Strategic Threat Advisor
                      </h3>
                      <span className="text-[8px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-900 px-1.5 py-0.5 rounded uppercase">
                        Real-time Gemini
                      </span>
                    </div>

                    <div className="space-y-4">
                      {selectedSupplier ? (
                        <div className="bg-slate-950/60 p-3.5 rounded-lg border-l-4 border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">{selectedSupplier.category} Sector</p>
                            <span className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded font-semibold ${
                              selectedSupplier.riskLevel === "Critical" ? "bg-rose-950 text-rose-400 border border-rose-900" :
                              selectedSupplier.riskLevel === "Medium" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                              "bg-emerald-950 text-emerald-400 border border-emerald-900"
                            }`}>
                              {selectedSupplier.riskLevel} Risk
                            </span>
                          </div>
                          <h4 className="text-white font-semibold text-xs font-sans mb-2">{selectedSupplier.name} Threat Dossier</h4>
                          <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                            {selectedSupplier.description}
                          </p>

                          <div className="mt-3 pt-3 border-t border-slate-900">
                            <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Actionable Mitigations:</p>
                            <ul className="space-y-1.5">
                              {selectedSupplier.mitigations.slice(0, 3).map((mit, i) => (
                                <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 font-sans">
                                  <span className="text-indigo-400 font-mono mt-0.5 font-bold">↳</span>
                                  <span>{mit}</span>
                                </li>
                              ))}
                            </ul>
                            {selectedSupplier.riskLevel === "Critical" && (
                              <div className="mt-3 p-2 bg-rose-950/40 border border-rose-900/60 rounded flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span className="text-[10px] text-rose-300 font-mono font-bold uppercase">
                                  Recommendation: Find alternative suppliers immediately.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-xs font-mono">
                          Select a node on the heat map to trigger active strategic advisors.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Strategy Engine: Gemini 3.5</span>
                    <button 
                      onClick={() => {
                        if (selectedSupplier) {
                          handleAiAnalysis(selectedSupplier.id);
                        } else {
                          showNotification("Please select a supplier dossier on the map.", "info");
                        }
                      }}
                      disabled={isAnalyzing !== null}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <RotateCw className="w-3 h-3 animate-spin" />
                          Analyzing Vector...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-indigo-200" />
                          Re-Analyze Supplier
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Section: Active Risk Monitoring Stream / Live Supplier Directory */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">Dynamic Risk Monitoring Stream</h3>
                    <p className="text-[10px] text-slate-500">Continuous enterprise signals audited using verified AES ciphers.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="text" 
                      placeholder="Search identity or products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                    />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] rounded px-2.5 py-1.5 font-mono focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {Object.values(SupplierCategory).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] rounded px-2.5 py-1.5 font-mono focus:outline-none"
                    >
                      <option value="All">All Tiers</option>
                      <option value="Tier 1">Tier 1</option>
                      <option value="Tier 2">Tier 2</option>
                      <option value="Tier 3">Tier 3</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-bold">Supplier Identity</th>
                        <th className="px-6 py-3 font-bold">Region & Sector</th>
                        <th className="px-6 py-3 font-bold">Vulnerability Score</th>
                        <th className="px-6 py-3 font-bold">Cipher Audit status</th>
                        <th className="px-6 py-3 font-bold">Mitigation Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100 font-sans">
                      {filteredSuppliers.map((sup) => {
                        const isCritical = sup.riskLevel === "Critical";
                        const isMedium = sup.riskLevel === "Medium";
                        const scoreBg = isCritical ? "bg-rose-50 border-rose-100 text-rose-700" : isMedium ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-700";
                        
                        return (
                          <tr 
                            key={sup.id} 
                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selectedSupplier?.id === sup.id ? "bg-indigo-50/40" : ""}`}
                            onClick={() => setSelectedSupplier(sup)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-slate-100 rounded text-slate-700">
                                  <Shield className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{sup.name}</p>
                                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{sup.tier} // {sup.revenue} Revenue</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-800">
                                <span className="font-medium">{sup.country}</span>
                                <span className="text-slate-400 mx-1.5">|</span>
                                <span className="text-slate-500 text-[11px]">{sup.category}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{sup.coreProducts.join(", ")}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono border ${scoreBg}`}>
                                  {sup.riskLevel} ({sup.riskScore})
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{sup.secureKeyId}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400 italic">{sup.secureKeyStatus}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">Audited: {sup.lastAuditDate}</p>
                            </td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedSupplier(sup);
                                    setActiveTab("profiles");
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold font-mono text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded uppercase tracking-wider"
                                >
                                  Dossier
                                </button>
                                <button 
                                  onClick={() => handleAiAnalysis(sup.id)}
                                  disabled={isAnalyzing !== null}
                                  className="px-2.5 py-1 text-[10px] font-bold font-mono bg-indigo-600 hover:bg-indigo-700 text-white rounded uppercase tracking-wider flex items-center gap-1"
                                >
                                  {isAnalyzing === sup.id ? (
                                    <RotateCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  Audit AI
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredSuppliers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                            No matching intelligence nodes identified in this partition.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VULNERABILITY MAP (DEDICATED EXTENSIVE MAP VIEW) */}
          {activeTab === "risk-map" && (
            <div className="space-y-6" id="risk-map-tab">
              <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md p-6 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400 animate-spin" />
                      Global Geopolitical & Logistics Pipeline Heat Map
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-1">
                      Visualizing shipping paths, component wafer origins, and rare earth deposits mapped in real-time.
                    </p>
                  </div>
                  <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono flex items-center gap-4">
                    <span className="text-slate-400">Security Clearance:</span>
                    <span className="text-indigo-400 font-bold uppercase">{currentRole}</span>
                  </div>
                </div>

                {/* Extensive World Map Section */}
                <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-lg max-w-xs text-[10px] font-mono space-y-2">
                    <p className="text-zinc-300 font-bold uppercase border-b border-slate-800 pb-1">Map Overlays</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Maritime Corridors:</span>
                      <span className="text-emerald-400 uppercase font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Territorial Flight Paths:</span>
                      <span className="text-amber-400 uppercase font-semibold">Caution</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seismic Monitoring:</span>
                      <span className="text-emerald-400 uppercase font-semibold">Nominal</span>
                    </div>
                  </div>

                  <svg viewBox="0 0 1000 450" className="w-full max-h-[380px] text-slate-700/40" stroke="currentColor" fill="none">
                    {/* Equator & Meridians */}
                    <line x1="0" y1="225" x2="1000" y2="225" stroke="rgba(255,255,255,0.06)" />
                    <line x1="500" y1="0" x2="500" y2="450" stroke="rgba(255,255,255,0.06)" />
                    <circle cx="500" cy="225" r="180" stroke="rgba(255,255,255,0.02)" />

                    {/* Continental shapes */}
                    <path d="M100,100 L300,80 L350,150 L420,200 L400,280 L350,380 L220,380 L180,300 Z" fill="rgba(15, 23, 42, 0.4)" strokeWidth="1" />
                    <path d="M480,120 L600,90 L750,110 L850,200 L800,320 L700,380 L550,380 L480,240 Z" fill="rgba(15, 23, 42, 0.4)" strokeWidth="1" />
                    
                    {/* Simulated shipping lanes lines */}
                    <path d="M260,100 Q380,180 500,225 T800,220" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="4,4" />
                    <path d="M670,85 Q650,180 350,150" stroke="rgba(244, 63, 94, 0.25)" strokeWidth="1.5" strokeDasharray="3,3" />

                    {suppliers.map((s) => {
                      const x = 500 + (s.lng * 2.2);
                      const y = 225 - (s.lat * 2.4);
                      const isCritical = s.riskLevel === "Critical";
                      const isMedium = s.riskLevel === "Medium";
                      const colorClass = isCritical ? "fill-rose-500 text-rose-500" : isMedium ? "fill-amber-500 text-amber-500" : "fill-emerald-500 text-emerald-500";

                      return (
                        <g key={s.id} className="cursor-pointer" onClick={() => setSelectedSupplier(s)}>
                          <circle cx={x} cy={y} r={s.riskScore * 0.2 + 4} className={`${colorClass} opacity-15`} />
                          <circle cx={x} cy={y} r="4" className={colorClass} />
                          <text x={x + 8} y={y + 3} className="fill-slate-300 font-mono text-[8px] pointer-events-none select-none">
                            {s.name.substring(0, 15)}...
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Side-by-side details panels */}
                <div className="grid grid-cols-3 gap-6 mt-6 text-slate-800">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span className="font-bold text-slate-900 uppercase">Suez Canal & Malacca Chokepoint Alerts</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      Critical shipping lanes are operating at high friction. Maritime carrier routing around South Africa is introducing 14-day pipeline delay offsets for Tier-1 assembly materials.
                    </p>
                    <div className="mt-3 p-2 bg-slate-100 rounded text-[10px] text-slate-500 uppercase">
                      Current Congestion Index: <span className="font-bold text-rose-600">92% DELAY</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-900 uppercase">Supplier Interdependencies</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      Quantum Semitronics wafer fabrications depend directly on photolithography solvent outputs from Apex ChemCorp in Germany. Disruption there propagates downstream in 18 days.
                    </p>
                    <div className="mt-3 p-2 bg-slate-100 rounded text-[10px] text-slate-500 uppercase">
                      Cascading Vulnerability: <span className="font-bold text-indigo-600">HIGH EXPOSURE</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 uppercase">Gemini Mitigations Generated</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      AI recommended expanding buffer inventory stockpiles at secure neutral transshipment zones in Singapore, Rotterdam, and Seattle to guarantee structural logic resilience.
                    </p>
                    <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 rounded text-[10px] uppercase font-bold">
                      Resilience Level: <span className="font-extrabold text-emerald-600">74% ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTELLIGENCE DOSSIERS (SUPPLIER PROFILES) */}
          {activeTab === "profiles" && (
            <div className="space-y-6" id="profiles-tab">
              <div className="grid grid-cols-3 gap-6">
                
                {/* Left Side: Supplier List Column */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col h-[550px]">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">Supplier Directory Partition</h3>
                    <p className="text-[10px] text-slate-400">Select identity to inspect active audited dossiers.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {suppliers.map(s => {
                      const isSelected = selectedSupplier?.id === s.id;
                      const isCritical = s.riskLevel === "Critical";
                      const isMedium = s.riskLevel === "Medium";
                      
                      return (
                        <div 
                          key={s.id}
                          onClick={() => setSelectedSupplier(s)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-slate-900 text-white border-slate-800 shadow-sm" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-xs font-mono">{s.name}</h4>
                            <span className={`text-[9px] font-mono px-1.5 rounded uppercase font-bold ${
                              isCritical ? "bg-rose-950 text-rose-400" :
                              isMedium ? "bg-amber-950 text-amber-400" :
                              "bg-emerald-950 text-emerald-400"
                            }`}>
                              {s.riskScore}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                            <span>{s.category} // {s.country}</span>
                            <span className={isSelected ? "text-indigo-400" : "text-slate-600 font-bold"}>{s.tier}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Provision Button Trigger */}
                  <button
                    onClick={() => setIsProvisioning(true)}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Enlist & Encrypt Supplier
                  </button>
                </div>

                {/* Center & Right: Detailed Selected Supplier Profile Dossier */}
                <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-6 h-[550px] overflow-y-auto flex flex-col justify-between">
                  {selectedSupplier ? (
                    <div className="space-y-6">
                      
                      {/* Identity Header */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-semibold">
                              {selectedSupplier.tier} Verified
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[10px] font-mono text-slate-400">{selectedSupplier.id}</span>
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedSupplier.name}</h2>
                          <p className="text-xs text-slate-500 font-sans mt-0.5">{selectedSupplier.category} Sector • Operations headquartered in {selectedSupplier.country}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Calculated Vulnerability Index</p>
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            <span className={`text-xl font-extrabold font-mono px-3 py-0.5 rounded ${
                              selectedSupplier.riskLevel === "Critical" ? "text-rose-600 bg-rose-50" :
                              selectedSupplier.riskLevel === "Medium" ? "text-amber-600 bg-amber-50" :
                              "text-emerald-600 bg-emerald-50"
                            }`}>
                              {selectedSupplier.riskLevel} ({selectedSupplier.riskScore}/100)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown Bars */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-3">AI Vulnerability Breakdown Metrics</h3>
                        <div className="grid grid-cols-5 gap-3">
                          {[
                            { label: "Supplier News", val: selectedSupplier.riskBreakdown.news, color: "bg-indigo-600" },
                            { label: "Market Volatility", val: selectedSupplier.riskBreakdown.market, color: "bg-amber-600" },
                            { label: "Regulations", val: selectedSupplier.riskBreakdown.regulation, color: "bg-blue-600" },
                            { label: "Delivery Choke", val: selectedSupplier.riskBreakdown.delivery, color: "bg-rose-600" },
                            { label: "Reputational Risk", val: selectedSupplier.riskBreakdown.reputation, color: "bg-purple-600" },
                          ].map((b, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 rounded p-2.5 font-mono text-center">
                              <p className="text-[9px] text-slate-400 uppercase tracking-tight line-clamp-1">{b.label}</p>
                              <p className="text-base font-bold text-slate-800 mt-1">{b.val}%</p>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className={`${b.color} h-full`} style={{ width: `${b.val}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Text details */}
                      <div className="grid grid-cols-2 gap-6 text-slate-800">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono text-xs">
                          <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide">Enterprise Profile Info</h4>
                          <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between"><span className="text-slate-400">Annual Revenue:</span> <span className="font-semibold text-slate-700">{selectedSupplier.revenue}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Last Crypt Audit:</span> <span className="font-semibold text-slate-700">{selectedSupplier.lastAuditDate}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Master Cipher ID:</span> <span className="font-mono text-indigo-600 font-semibold">{selectedSupplier.secureKeyId}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Keys Rotation status:</span> <span className="font-semibold text-slate-700 uppercase">{selectedSupplier.secureKeyStatus}</span></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono text-xs">
                          <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide">Core Physical Output</h4>
                          <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-600 font-sans">
                            {selectedSupplier.coreProducts.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Mitigations Override Form */}
                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-indigo-600" />
                            Assigned Mitigation Protocols
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono italic">Role required: Supply Chain Director</span>
                        </div>
                        
                        <div className="space-y-2">
                          {selectedSupplier.mitigations.map((mit, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 px-3.5 py-2 rounded text-[11px] font-sans flex items-start gap-2 text-slate-700">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{mit}</span>
                            </div>
                          ))}
                        </div>

                        {/* Input override for mitigations */}
                        <div className="mt-4 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Append manual tactical defense override directive..." 
                            value={newMitigation}
                            onChange={(e) => setNewMitigation(e.target.value)}
                            className="flex-1 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] rounded px-3 py-1.5 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={handleAddMitigation}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider"
                          >
                            Assign Protocol
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 font-mono text-xs">
                      <FolderSearch className="w-12 h-12 text-slate-300 mb-2" />
                      <span>Select a supply chain partner to decrypt dossier.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Secure Provisioning Modal Layer */}
              {isProvisioning && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative font-sans">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800 border-b border-slate-200 pb-3 mb-4">
                      Enroll New Supply Partner Pipeline
                    </h3>
                    
                    <form onSubmit={handleProvisionSupplier} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Supplier Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Neo-Silica Ltd" 
                            value={newSupName}
                            onChange={(e) => setNewSupName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Country Headquarters</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Taiwan" 
                            value={newSupCountry}
                            onChange={(e) => setNewSupCountry(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Sourcing Sector</label>
                          <select 
                            value={newSupCategory}
                            onChange={(e) => setNewSupCategory(e.target.value as SupplierCategory)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {Object.values(SupplierCategory).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Critical Tier Designation</label>
                          <select 
                            value={newSupTier}
                            onChange={(e) => setNewSupTier(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                          >
                            <option value="Tier 1">Tier 1 (Direct Impact)</option>
                            <option value="Tier 2">Tier 2 (Secondary Subsystem)</option>
                            <option value="Tier 3">Tier 3 (Raw Materials Feedstock)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Annual Revenue</label>
                          <input 
                            type="text" 
                            placeholder="e.g. $1.2B" 
                            value={newSupRevenue}
                            onChange={(e) => setNewSupRevenue(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Core Physical Products</label>
                          <input 
                            type="text" 
                            placeholder="Commas separated e.g. Wafer Dies, Opto-sensors" 
                            value={newSupProducts}
                            onChange={(e) => setNewSupProducts(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Confidential Strategy & Details</label>
                        <textarea 
                          rows={3}
                          placeholder="Confidential intelligence brief regarding geographic exposure and sovereign dependencies..."
                          value={newSupDescription}
                          onChange={(e) => setNewSupDescription(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                        />
                      </div>

                      <div className="bg-slate-50 p-3 rounded border border-slate-100 text-[10px] text-slate-500 font-mono">
                        <span className="font-bold text-indigo-600 block mb-1">🔒 INTEGRITY COMPLIANCE LOCK</span>
                        Upon submission, this supplier record is cryptographically sealed with AES-256 GCM. A randomized key footprint is locked to your session ID.
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button 
                          type="button" 
                          onClick={() => setIsProvisioning(false)}
                          className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-mono font-bold uppercase"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider"
                        >
                          Enlist & Crypt Record
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: SECURITY CENTER */}
          {activeTab === "security" && (
            <div className="space-y-6" id="security-tab">
              <div className="grid grid-cols-3 gap-6">
                
                {/* Left side: Cipher vector status & rotational panel */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 border-b border-slate-100 pb-2 mb-3">
                      Master Encryption Key Status
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      All Supplier profiles and mitigation instructions are stored with dedicated envelope-level AES-256 GCM encryption keys.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-lg text-white font-mono text-xs space-y-3 border border-slate-800">
                      <div>
                        <p className="text-zinc-500 text-[9px] uppercase">AES-256 MASTER DATA KEY</p>
                        <p className="text-emerald-400 font-bold uppercase tracking-wider mt-0.5">● ACTIVE & ARMED</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[9px] uppercase">SHA-256 FINGERPRINT</p>
                        <p className="text-[10px] font-semibold text-zinc-300 break-all select-all leading-normal">
                          {securityStatus?.aesKeyFingerprint || "E6:D8:1A:4C:FB:89:C3:A2:30:4F:91:DE:BC:60:E5:8D:11:AB:F5:44"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-900">
                        <div>
                          <p className="text-zinc-500 text-[8px] uppercase">LAST ROTATED</p>
                          <p className="text-indigo-400 mt-0.5">{securityStatus?.lastRotated || "2026-07-09 02:00:45"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[8px] uppercase">TLS CONTEXT</p>
                          <p className="text-zinc-300 mt-0.5">TLS 1.3 / ECDHE</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 font-mono text-xs text-slate-800">
                    <h4 className="font-bold text-slate-900 uppercase">Key Lifecycle Manager</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Security policy dictates Master Ciphers should be rotated every 24 hours. Emergency rotation can be manual.
                    </p>
                    <button 
                      onClick={handleKeyRotation}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                    >
                      <RotateCw className="w-4 h-4" />
                      Rotate Master AES Key
                    </button>
                    <p className="text-[9px] text-slate-400 text-center uppercase">Role required: Security Admin</p>
                  </div>
                </div>

                {/* Center side: API Keys Management */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 border-b border-slate-100 pb-2 mb-3">
                      Authorized API Client Tokens
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      Manage external endpoints synchronizing with SAP HANA ERP pipelines and Bloomberg Terminal intelligence tickers.
                    </p>

                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                      {apiKeys.map(k => (
                        <div key={k.id} className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{k.keyHint}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              k.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                            }`}>
                              {k.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">{k.description}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1.5 border-t border-slate-200">
                            <span>Auth Tier: {k.role}</span>
                            {k.status === "Active" ? (
                              <button 
                                onClick={() => handleRevokeApiKey(k.id)}
                                className="text-rose-600 font-extrabold uppercase hover:underline"
                              >
                                Revoke Token
                              </button>
                            ) : (
                              <span className="italic text-zinc-400">Severed</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleCreateApiKey} className="pt-4 border-t border-slate-100 space-y-3 font-mono text-xs">
                    <h4 className="font-bold text-slate-900 uppercase">Issue New Client Token</h4>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Description (e.g. Palantir Data Foundry Link)" 
                        value={newKeyDesc}
                        onChange={(e) => setNewKeyDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <div className="flex gap-2">
                        <select
                          value={newKeyRole}
                          onChange={(e) => setNewKeyRole(e.target.value as SecurityRole)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value={SecurityRole.RISK_ANALYST}>Risk Analyst Access</option>
                          <option value={SecurityRole.SUPPLY_CHAIN_DIRECTOR}>Supply Director Access</option>
                          <option value={SecurityRole.SECURITY_ADMIN}>Security Admin Access</option>
                        </select>
                        <button 
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 rounded text-xs font-bold uppercase tracking-wider"
                        >
                          Issue Key
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right side: Live Security Audit Logs */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 border-b border-slate-100 pb-2 mb-1">
                      System Integrity Crypt-Logs
                    </h3>
                    <p className="text-[10px] text-slate-400">Real-time immutable ledger of platform access vectors.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-[10px]">
                    {auditLogs.map(log => (
                      <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded space-y-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`font-semibold uppercase ${
                            log.type === "Security" ? "text-indigo-600" :
                            log.type === "Risk" ? "text-amber-600" :
                            "text-slate-500"
                          }`}>{log.type}</span>
                        </div>
                        <p className="font-bold text-slate-800">{log.action}</p>
                        <p className="text-slate-600 text-[9px] leading-relaxed break-all">{log.details}</p>
                        <div className="text-right text-[8px] text-slate-400">
                          by {log.user.split('@')[0]} ({log.role})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: ARCHITECTURE & DB (PALANTIR / SAP INSPIRED SCHEMAS) */}
          {activeTab === "architecture" && (
            <div className="space-y-6" id="architecture-tab">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6 font-mono text-xs">
                <div>
                  <h2 className="text-sm font-bold tracking-wider uppercase text-slate-800 border-b border-slate-200 pb-3 mb-3 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    SupplyGuard Secure Federated Architecture
                  </h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    The platform coordinates telemetry from multi-source enterprise API pipelines (SAP ERP, Bloomberg Data Feeds, custom sovereign intelligence) and executes federated sanitization prior to updating local databases.
                  </p>
                </div>

                {/* Visual Architecture flowchart */}
                <div className="grid grid-cols-5 gap-4 items-center bg-slate-900 text-white p-5 rounded-xl border border-slate-800 relative">
                  
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                    <p className="text-[9px] text-indigo-400 font-bold uppercase">Data Feeds</p>
                    <p className="text-[10px] text-zinc-300 font-semibold mt-1">SAP ERP</p>
                    <p className="text-[10px] text-zinc-300 font-semibold">Bloomberg API</p>
                    <span className="text-[8px] text-zinc-500 block mt-2">Unencrypted Source</span>
                  </div>

                  <div className="flex justify-center text-indigo-400 font-bold">
                    <span>──▶</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-indigo-900 text-center relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                      Sanitizer
                    </div>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase mt-1">API Shield</p>
                    <p className="text-[10px] text-zinc-300 font-semibold mt-1">TLS 1.3 Handshake</p>
                    <p className="text-[10px] text-zinc-300 font-semibold">AES Envelope Seal</p>
                  </div>

                  <div className="flex justify-center text-indigo-400 font-bold">
                    <span>──▶</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-emerald-900 text-center relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                      Core Database
                    </div>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Cipher Crypt</p>
                    <p className="text-[10px] text-zinc-300 font-semibold mt-1">Isolated State Memory</p>
                    <p className="text-[10px] text-zinc-300 font-semibold text-emerald-400">Immutable Crypt-Logs</p>
                  </div>

                </div>

                {/* Database schemas and tables */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Enterprise Intelligence Database Blueprints</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase">Table: `suppliers`</p>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p><strong className="text-slate-800">id</strong> VARCHAR(64) PRIMARY KEY</p>
                        <p><strong className="text-slate-800">name</strong> VARCHAR(255) NOT NULL</p>
                        <p><strong className="text-slate-800">country</strong> VARCHAR(128)</p>
                        <p><strong className="text-slate-800">riskScore</strong> INT CHECK(riskScore BETWEEN 0 AND 100)</p>
                        <p><strong className="text-slate-800">secureKeyId</strong> VARCHAR(128) UNIQUE</p>
                        <p><strong className="text-slate-800">riskBreakdown</strong> JSONB NOT NULL</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase">Table: `audit_logs`</p>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p><strong className="text-slate-800">id</strong> VARCHAR(64) PRIMARY KEY</p>
                        <p><strong className="text-slate-800">timestamp</strong> TIMESTAMP DEFAULT NOW()</p>
                        <p><strong className="text-slate-800">user</strong> VARCHAR(255) NOT NULL</p>
                        <p><strong className="text-slate-800">action</strong> TEXT NOT NULL</p>
                        <p><strong className="text-slate-800">type</strong> VARCHAR(32) -- Security, Risk, System</p>
                        <p><strong className="text-slate-800">details</strong> TEXT NOT NULL</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase">Table: `client_tokens`</p>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p><strong className="text-slate-800">id</strong> VARCHAR(64) PRIMARY KEY</p>
                        <p><strong className="text-slate-800">keyHint</strong> VARCHAR(32) NOT NULL</p>
                        <p><strong className="text-slate-800">roleAllowed</strong> VARCHAR(64) NOT NULL</p>
                        <p><strong className="text-slate-800">expiresAt</strong> TIMESTAMP NOT NULL</p>
                        <p><strong className="text-slate-800">status</strong> VARCHAR(16) DEFAULT 'Active'</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: ENTERPRISE SUBSCRIPTION & PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6" id="pricing-tab">
              <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
                <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight uppercase">SupplyGuard Corporate Licenses</h2>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Enterprise-wide security tokens, military-grade envelope file encryption, real-time Gemini AI supply pipeline re-routing simulations, and 24/7 dedicated cyber defense response desks.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Plan 1 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                      Standard Analyst
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Corporate Base</h3>
                    <p className="text-2xl font-extrabold font-mono text-slate-800">$4,500<span className="text-xs text-slate-400 font-normal"> / month</span></p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      Ideal for single-region manufacturing sectors looking to audit up to 25 core suppliers.
                    </p>
                    <ul className="space-y-1.5 text-[10px] text-slate-600 font-mono pt-3 border-t border-slate-100">
                      <li>✓ Up to 25 Supplier Dossiers</li>
                      <li>✓ Standard AES-256 Key Encryption</li>
                      <li>✓ Basic API Sandbox Integration</li>
                      <li>✓ Weekly Risk Threat Briefing</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => showNotification("Initiating upgrade sequence... Handshake sent to billing partner.", "info")}
                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold font-mono uppercase tracking-wider"
                  >
                    Select Corporate Base
                  </button>
                </div>

                {/* Plan 2: Best Value */}
                <div className="bg-slate-950 text-white border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-3 py-1 uppercase tracking-wider font-mono rounded-bl-lg">
                    Recommended Tier
                  </div>
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded uppercase">
                      Enterprise Suite
                    </span>
                    <h3 className="text-lg font-bold text-white font-sans">Operations Global</h3>
                    <p className="text-2xl font-extrabold font-mono text-indigo-400">$12,000<span className="text-xs text-slate-500 font-normal"> / month</span></p>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Complete global multi-source supply chain tracking. Highly recommended for multi-tier chip and aerospace OEMs.
                    </p>
                    <ul className="space-y-1.5 text-[10px] text-slate-300 font-mono pt-3 border-t border-slate-900">
                      <li>✓ Unlimited Sourced Suppliers</li>
                      <li>✓ Real-Time Gemini AI Diagnostics</li>
                      <li>✓ Active Automated Master Key Rotation</li>
                      <li>✓ SAP HANA & Bloomberg Live Links</li>
                      <li>✓ Instant alternative re-routing advice</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => showNotification("Initiating upgrade sequence... Handshake sent to billing partner.", "info")}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-xs font-bold font-mono uppercase tracking-wider shadow-md"
                  >
                    Deploy Operations Global
                  </button>
                </div>

                {/* Plan 3 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                      Sovereign Defense
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Federated Custom</h3>
                    <p className="text-2xl font-extrabold font-mono text-slate-800">Custom Quote</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      Fully isolated private container cloud deployment for aerospace defense contractors and federal infrastructure departments.
                    </p>
                    <ul className="space-y-1.5 text-[10px] text-slate-600 font-mono pt-3 border-t border-slate-100">
                      <li>✓ Private Isolated HSM keys</li>
                      <li>✓ On-Premises Relational Spanner Clusters</li>
                      <li>✓ Custom Fine-tuned Gemini models</li>
                      <li>✓ Government-Cleared Cyber Analysts</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => showNotification("Secure link queued. Our Global Security Desk will establish contact shortly.", "success")}
                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold font-mono uppercase tracking-wider"
                  >
                    Establish Secure Brief
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
