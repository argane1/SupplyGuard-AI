/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini SDK successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
  }
} else {
  console.log("GEMINI_API_KEY is missing. Running in high-fidelity sandbox fallback mode.");
}

// In-Memory Database Seed data
let suppliers = [
  {
    id: "sup-1",
    name: "Quantum Semitronics Ltd",
    country: "Taiwan",
    lat: 24.78,
    lng: 120.99,
    riskScore: 24,
    riskLevel: "Low",
    category: "Semiconductors",
    tier: "Tier 1",
    revenue: "$4.2B",
    coreProducts: ["3nm Application Processors", "RF Transceiver Dies", "Automotive ASICs"],
    secureKeyId: "K-AES-QT8892",
    secureKeyStatus: "Active",
    lastAuditDate: "2026-06-15",
    description: "Primary wafer fabrication foundry. Highly integrated with global logic boards. Vulnerable to regional seismic disturbances and trade corridor restrictions.",
    riskBreakdown: { news: 30, market: 15, regulation: 20, delivery: 40, reputation: 10 },
    mitigations: [
      "Contractual multi-foundry allocation agreement.",
      "Buffer inventory stockpiled in Singapore hub (45-day supply)."
    ]
  },
  {
    id: "sup-2",
    name: "NeoLithium Battery Systems",
    country: "Australia",
    lat: -31.95,
    lng: 115.86,
    riskScore: 48,
    riskLevel: "Medium",
    category: "Raw Materials",
    tier: "Tier 2",
    revenue: "$1.8B",
    coreProducts: ["Battery-Grade Lithium Hydroxide", "Anode Graphite Blocks"],
    secureKeyId: "K-AES-NL4109",
    secureKeyStatus: "Active",
    lastAuditDate: "2026-07-01",
    description: "Refiner of high-purity battery compounds. Exposed to raw material commodity pricing volatility and localized labor industrial disputes.",
    riskBreakdown: { news: 45, market: 65, regulation: 50, delivery: 30, reputation: 40 },
    mitigations: [
      "Index-linked hedging structures for lithium price stabilization.",
      "Prequalifying alternative synthetic graphite suppliers."
    ]
  },
  {
    id: "sup-3",
    name: "Pacific Maritime Logistics",
    country: "Singapore",
    lat: 1.35,
    lng: 103.82,
    riskScore: 82,
    riskLevel: "Critical",
    category: "Logistics",
    tier: "Tier 1",
    revenue: "$12.4B",
    coreProducts: ["Intermodal Container Shipping", "Transpacific Freight Routing", "Customs Brokerage"],
    secureKeyId: "K-AES-PM7112",
    secureKeyStatus: "Rotating",
    lastAuditDate: "2026-07-08",
    description: "Core global shipping provider managing East-West transport corridors. Currently facing severe operational delays, labor strikes at secondary West Coast terminals, and maritime canal chokepoints.",
    riskBreakdown: { news: 85, market: 70, regulation: 65, delivery: 95, reputation: 60 },
    mitigations: [
      "Rerouting critical components to air-freight corridors for premium delivery.",
      "Contracting dual-logistics carriers across regional routes."
    ]
  },
  {
    id: "sup-4",
    name: "Apex ChemCorp",
    country: "Germany",
    lat: 49.48,
    lng: 8.46,
    riskScore: 56,
    riskLevel: "Medium",
    category: "Chemicals",
    tier: "Tier 2",
    revenue: "$2.9B",
    coreProducts: ["Photolithography Solvents", "High-Purity Silicon Sealants"],
    secureKeyId: "K-AES-AC3320",
    secureKeyStatus: "Active",
    lastAuditDate: "2026-05-19",
    description: "Chemical synthesis plants providing photo-reactive solutions. Affected by strict EU regulatory changes regarding carbon emissions and volatile petrochemical feedstocks.",
    riskBreakdown: { news: 50, market: 55, regulation: 80, delivery: 45, reputation: 40 },
    mitigations: [
      "Establishing regulatory variance compliance program.",
      "Diversified base chemical sourcing in North America."
    ]
  },
  {
    id: "sup-5",
    name: "Valyrian Steelworks AB",
    country: "Sweden",
    lat: 67.85,
    lng: 20.22,
    riskScore: 18,
    riskLevel: "Low",
    category: "Raw Materials",
    tier: "Tier 3",
    revenue: "$950M",
    coreProducts: ["Ultra-High Strength Structural Steel", "Reinforced Tool Alloys"],
    secureKeyId: "K-AES-VS0991",
    secureKeyStatus: "Active",
    lastAuditDate: "2026-06-22",
    description: "Sovereign-backed arctic mining and high-precision steel extrusion. Reliable output, powered by 100% carbon-free regional hydroelectricity.",
    riskBreakdown: { news: 15, market: 20, regulation: 10, delivery: 25, reputation: 10 },
    mitigations: [
      "Standard multi-year purchase arrangements with pre-established volume price protections."
    ]
  },
  {
    id: "sup-6",
    name: "BioSustain Packaging",
    country: "Brazil",
    lat: -23.55,
    lng: -46.63,
    riskScore: 35,
    riskLevel: "Low",
    category: "Packaging",
    tier: "Tier 3",
    revenue: "$780M",
    coreProducts: ["Compostable Protective Inserts", "Recycled Fiberboards"],
    secureKeyId: "K-AES-BS1104",
    secureKeyStatus: "Active",
    lastAuditDate: "2026-04-10",
    description: "Biodegradable industrial packaging supplier. High sustainability profile. Exposed to seasonal logistics disruption in local river ports during heavy rainfall seasons.",
    riskBreakdown: { news: 35, market: 30, regulation: 40, delivery: 45, reputation: 20 },
    mitigations: [
      "Seasonal stockpiling of flat-packed fiberboards in regional warehouse networks.",
      "Active climate monitor and rail-car substitution plan."
    ]
  }
];

let auditLogs = [
  {
    id: "log-1",
    timestamp: "2026-07-09T01:00:12Z",
    user: "rachidargane@gmail.com",
    role: "Security Admin",
    action: "Platform Security Handshake",
    type: "Security",
    details: "Initialized secure database tunnel. Database encryption: AES-256 enabled."
  },
  {
    id: "log-2",
    timestamp: "2026-07-09T01:15:34Z",
    user: "rachidargane@gmail.com",
    role: "Supply Chain Director",
    action: "Core Supplier Risk Audit",
    type: "Risk",
    details: "Initiated batch risk score refresh across Taiwan, Singapore shipping routes."
  },
  {
    id: "log-3",
    timestamp: "2026-07-09T02:00:45Z",
    user: "System Daemon",
    role: "Security Admin",
    action: "Key Rotation Initiated",
    type: "Security",
    details: "Automated rotation for key 'K-AES-PM7112' (Pacific Maritime Logistics)."
  }
];

let apiKeys = [
  {
    id: "key-1",
    keyHint: "sg_live_7a9f...4f2e",
    description: "SAP ERP Production Synchronization Pipeline",
    role: "Supply Chain Director",
    createdAt: "2026-06-01T10:00:00Z",
    expiresAt: "2027-06-01T10:00:00Z",
    status: "Active"
  },
  {
    id: "key-2",
    keyHint: "sg_live_3b1d...8c9a",
    description: "Bloomberg Terminal Security Metric Feed",
    role: "Risk Analyst",
    createdAt: "2026-06-15T14:30:00Z",
    expiresAt: "2027-06-15T14:30:00Z",
    status: "Active"
  },
  {
    id: "key-3",
    keyHint: "sg_test_9c2a...001e",
    description: "Sandbox Staging Integration Testing Key",
    role: "Risk Analyst",
    createdAt: "2026-05-10T08:00:00Z",
    expiresAt: "2026-08-10T08:00:00Z",
    status: "Expired"
  }
];

let securityStatus = {
  aesKeyActive: true,
  aesKeyFingerprint: "E6:D8:1A:4C:FB:89:C3:A2:30:4F:91:DE:BC:60:E5:8D:11:AB:F5:44",
  tlsVersion: "TLS 1.3",
  lastRotated: "2026-07-09 02:00:45",
  databaseEncryptionStatus: "Full"
};

// API Endpoints

// 1. Fetch Suppliers
app.get("/api/suppliers", (req, res) => {
  res.json(suppliers);
});

// 2. Fetch specific supplier
app.get("/api/suppliers/:id", (req, res) => {
  const supplier = suppliers.find(s => s.id === req.params.id);
  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404).json({ error: "Supplier not found" });
  }
});

// 3. Create Supplier (Requires Supply Chain Director or Security Admin roles in frontend)
app.post("/api/suppliers", (req, res) => {
  const { name, country, lat, lng, category, tier, revenue, coreProducts, description } = req.body;
  if (!name || !category || !tier) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newSupplier = {
    id: `sup-${Date.now()}`,
    name,
    country: country || "Unknown",
    lat: Number(lat) || 0,
    lng: Number(lng) || 0,
    riskScore: Math.floor(Math.random() * 40) + 10, // Default moderate risk
    riskLevel: "Medium",
    category,
    tier,
    revenue: revenue || "$100M",
    coreProducts: Array.isArray(coreProducts) ? coreProducts : [coreProducts],
    secureKeyId: `K-AES-${Math.floor(Math.random() * 9000) + 1000}`,
    secureKeyStatus: "Active",
    lastAuditDate: new Date().toISOString().split('T')[0],
    description: description || "New supplier securely provisioned into platform.",
    riskBreakdown: {
      news: Math.floor(Math.random() * 50) + 10,
      market: Math.floor(Math.random() * 50) + 10,
      regulation: Math.floor(Math.random() * 50) + 10,
      delivery: Math.floor(Math.random() * 50) + 10,
      reputation: Math.floor(Math.random() * 50) + 10
    },
    mitigations: ["Setup baseline logistics contingency."]
  };

  suppliers.push(newSupplier as any);
  res.status(201).json(newSupplier);
});

// 4. Update mitigations
app.post("/api/suppliers/:id/mitigations", (req, res) => {
  const supplierIndex = suppliers.findIndex(s => s.id === req.params.id);
  if (supplierIndex !== -1) {
    const { mitigations } = req.body;
    if (Array.isArray(mitigations)) {
      suppliers[supplierIndex].mitigations = mitigations;
      res.json(suppliers[supplierIndex]);
    } else {
      res.status(400).json({ error: "Mitigations must be an array of strings" });
    }
  } else {
    res.status(404).json({ error: "Supplier not found" });
  }
});

// 5. Audit Logs
app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

app.post("/api/audit-logs", (req, res) => {
  const { user, role, action, type, details } = req.body;
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || "rachidargane@gmail.com",
    role: role || "Risk Analyst",
    action: action || "User Action",
    type: type || "System",
    details: details || "No details provided"
  };
  auditLogs.unshift(newLog as any);
  res.status(201).json(newLog);
});

// 6. Security Status Configuration
app.get("/api/security-status", (req, res) => {
  res.json(securityStatus);
});

app.post("/api/security-status/rotate-key", (req, res) => {
  const user = req.body.user || "rachidargane@gmail.com";
  const role = req.body.role || "Security Admin";

  if (role !== "Security Admin") {
    return res.status(403).json({ error: "Insufficient clearance level. Requires Security Admin." });
  }

  // Generate mock premium AES key fingerprint
  const characters = "0123456789ABCDEF";
  let newFingerprint = "";
  for (let i = 0; i < 20; i++) {
    newFingerprint += characters.charAt(Math.floor(Math.random() * 16)) + characters.charAt(Math.floor(Math.random() * 16));
    if (i < 19) newFingerprint += ":";
  }

  securityStatus.aesKeyFingerprint = newFingerprint;
  securityStatus.lastRotated = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Auto-rotate supplier keys in sync
  suppliers = suppliers.map(s => ({
    ...s,
    secureKeyStatus: "Active",
    secureKeyId: `K-AES-${Math.floor(Math.random() * 9000) + 1000}`
  }));

  // Append Audit Log
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    role,
    action: "Master AES-256 Key Rotation",
    type: "Security",
    details: `Rotated AES master data key. Generated fresh encryption vector: ${newFingerprint.substring(0, 11)}...`
  };
  auditLogs.unshift(newLog as any);

  res.json({ success: true, securityStatus, log: newLog });
});

// 7. API Keys Configuration
app.get("/api/api-keys", (req, res) => {
  res.json(apiKeys);
});

app.post("/api/api-keys", (req, res) => {
  const { description, role, user } = req.body;
  if (!description || !role) {
    return res.status(400).json({ error: "Missing key parameters" });
  }

  const bytes = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const newKey = {
    id: `key-${Date.now()}`,
    keyHint: `sg_live_${bytes.substring(0, 4)}...${bytes.substring(12)}`,
    description,
    role,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active"
  };

  apiKeys.unshift(newKey as any);

  // Log action
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || "rachidargane@gmail.com",
    role: "Security Admin",
    action: "External API Token Created",
    type: "Security",
    details: `Issued new access key for ${description}. Authorization tier: ${role}.`
  } as any);

  res.status(201).json(newKey);
});

app.post("/api/api-keys/:id/revoke", (req, res) => {
  const keyIndex = apiKeys.findIndex(k => k.id === req.params.id);
  const user = req.body.user || "rachidargane@gmail.com";

  if (keyIndex !== -1) {
    apiKeys[keyIndex].status = "Revoked";

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      role: "Security Admin",
      action: "API Token Revocation",
      type: "Security",
      details: `Revoked API Key Hint: ${apiKeys[keyIndex].keyHint}. Session connections severed.`
    } as any);

    res.json(apiKeys[keyIndex]);
  } else {
    res.status(404).json({ error: "API Key not found" });
  }
});

// 8. AI Gemini Supplier Risk Analysis & Insights
app.post("/api/gemini/analyze", async (req, res) => {
  const { supplierId } = req.body;
  const supplier = suppliers.find(s => s.id === supplierId);

  if (!supplier) {
    return res.status(404).json({ error: "Supplier profile details not found" });
  }

  if (!ai) {
    // Elegant fallback mock insights if API key is not active
    console.log("No Gemini API key available. Generating realistic enterprise fallback analysis.");
    const fallbackResponse = generateEnterpriseFallbackInsights(supplier);
    return res.json(fallbackResponse);
  }

  try {
    const prompt = `
      Perform a rigorous, enterprise-grade, Palantir/Bloomberg-inspired supply chain risk analysis for the following supplier:
      Name: ${supplier.name}
      Category: ${supplier.category}
      Country: ${supplier.country}
      Revenue: ${supplier.revenue}
      Current Core Products: ${supplier.coreProducts.join(", ")}
      Current Risk Score: ${supplier.riskScore}/100
      Description: ${supplier.description}

      Please compute updated risk telemetry metrics based on simulated real-time market signals.
      Provide realistic enterprise intelligence detailing:
      1. An overall dynamic risk summary.
      2. Dynamic calculated risk scores (0-100) for News, Market, Regulation, Delivery, and Reputation.
      3. A set of 3 dynamic simulated regional news headlines with dates and severity ("Critical", "High", "Medium", "Low") related to supply chain issues for this type of supplier.
      4. A list of 4 highly actionable and professional enterprise mitigations (e.g. "Prequalify Tier-2 backup suppliers in neutral territories", "Initiate sovereign hedging index for logistics raw material buffer").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert supply chain risk scientist and lead intelligence analyst for an elite global logistics platform. Output structured JSON strictly satisfying the requested response schema format. Do not use markdown backticks around JSON output, just plain JSON text.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisSummary: {
              type: Type.STRING,
              description: "A professional, dense, and objective executive summary of the supplier's immediate risks."
            },
            overallScore: {
              type: Type.INTEGER,
              description: "Calculated overall supplier risk score from 1 to 99"
            },
            riskLevel: {
              type: Type.STRING,
              description: "Must be 'Low', 'Medium', or 'Critical'"
            },
            riskBreakdown: {
              type: Type.OBJECT,
              properties: {
                news: { type: Type.INTEGER },
                market: { type: Type.INTEGER },
                regulation: { type: Type.INTEGER },
                delivery: { type: Type.INTEGER },
                reputation: { type: Type.INTEGER }
              },
              required: ["news", "market", "regulation", "delivery", "reputation"]
            },
            simulatedNews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  date: { type: Type.STRING }
                },
                required: ["id", "headline", "message", "severity", "date"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 expert level actionable strategic recommendations"
            }
          },
          required: ["analysisSummary", "overallScore", "riskLevel", "riskBreakdown", "simulatedNews", "recommendations"]
        }
      }
    });

    const resultText = response.text;
    const parsedResult = JSON.parse(resultText);

    // Sync state in memory
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    if (supplierIndex !== -1) {
      suppliers[supplierIndex].riskScore = parsedResult.overallScore;
      suppliers[supplierIndex].riskLevel = parsedResult.riskLevel;
      suppliers[supplierIndex].riskBreakdown = parsedResult.riskBreakdown;
      suppliers[supplierIndex].mitigations = parsedResult.recommendations;
      suppliers[supplierIndex].lastAuditDate = new Date().toISOString().split('T')[0];
    }

    res.json({
      success: true,
      data: parsedResult,
      isRealAi: true
    });

  } catch (error: any) {
    console.error("Gemini API calculation failed. Running sandbox fallback.", error);
    const fallbackResponse = generateEnterpriseFallbackInsights(supplier);
    res.json({
      success: true,
      data: fallbackResponse,
      isRealAi: false,
      aiErrorHint: error.message
    });
  }
});

// Helper function to generate realistic, high-fidelity fallback responses
function generateEnterpriseFallbackInsights(supplier: any) {
  let overallScore = supplier.riskScore;
  let riskLevel = supplier.riskLevel;
  let analysisSummary = "";
  let recommendations: string[] = [];
  let simulatedNews: any[] = [];

  const nowStr = new Date().toISOString().split('T')[0];

  if (supplier.category === "Semiconductors") {
    overallScore = 32;
    riskLevel = "Low";
    analysisSummary = " wafer yield optimization pipelines are solid. Minor trade-route bottlenecking remains in East Asia channels, but high local automation and dual-source logic assemblies isolate core exposure.";
    simulatedNews = [
      {
        id: "nw-f-1",
        headline: "Maritime Passage Tariffs Surge in Taiwan Straits",
        message: "New administrative tariff protocols lead to custom backlogs for electronic components.",
        severity: "Medium",
        date: nowStr
      },
      {
        id: "nw-f-2",
        headline: "Rare Gas Neon Supply Stabilizes After Secondary Mine Commissioning",
        message: "Global noble gas yields for gas lasers reach safe 12-month reserves levels.",
        severity: "Low",
        date: nowStr
      }
    ];
    recommendations = [
      "Find alternative physical wafer packaging suppliers.",
      "Expand cleanroom gas buffers to 90 days operations.",
      "Audit physical storage facilities in Singapore logistics parks.",
      "Lock down raw quartz silica contracts for 2027 fiscal cycle."
    ];
  } else if (supplier.category === "Logistics") {
    overallScore = 88;
    riskLevel = "Critical";
    analysisSummary = "Severe systemic congestion detected across transoceanic shipping routes. Dock worker walkouts at terminal gates combined with security risks in Suez/Malacca channels has compromised port throughput velocity.";
    simulatedNews = [
      {
        id: "nw-f-3",
        headline: "Dock Worker Walkout Halts Key Intermodal Terminal Hubs",
        message: "Union contract negotiations hit complete standstill, triggering freight delays across 12 deepwater ports.",
        severity: "Critical",
        date: nowStr
      },
      {
        id: "nw-f-4",
        headline: "Severe Rail Congestion Delays Inbound Container Deliveries",
        message: "Chassis shortages and rail yard bottlenecks block heavy shipping container retrieval.",
        severity: "High",
        date: nowStr
      }
    ];
    recommendations = [
      "Find alternative air cargo charter routes to bypass choked maritime lanes.",
      "Redistribute safety stock storage across secondary inland ports.",
      "Renegotiate carrier SLA minimums to guarantee priority loading slots.",
      "Implement real-time GPS telemetry container alerts on critical high-value freight."
    ];
  } else {
    overallScore = 52;
    riskLevel = "Medium";
    analysisSummary = "The supplier's supply chain remains moderately integrated, with average exposure to energy cost fluctuations and ESG policy revisions. Deliveries are steady but vulnerable to short-term weather anomalies.";
    simulatedNews = [
      {
        id: "nw-f-5",
        headline: "Regional Climate Anomaly Disrupts Local Transport Canals",
        message: "Unseasonably low water tables force load restrictions on bulk cargo barge vessels.",
        severity: "Medium",
        date: nowStr
      }
    ];
    recommendations = [
      "Diversify geographic supplier nodes to secondary locations.",
      "Hedge key energy intensive component prices.",
      "Deploy localized IoT sensors on thermal sensitive shipping containers.",
      "Perform bi-annual ESG and carbon-emission audit compliance tests."
    ];
  }

  // Update original supplier database metrics to persist
  supplier.riskScore = overallScore;
  supplier.riskLevel = riskLevel;
  supplier.mitigations = recommendations;
  supplier.lastAuditDate = nowStr;

  return {
    analysisSummary,
    overallScore,
    riskLevel,
    riskBreakdown: {
      news: Math.max(supplier.riskBreakdown.news - 5, 20),
      market: Math.min(supplier.riskBreakdown.market + 8, 90),
      regulation: supplier.riskBreakdown.regulation,
      delivery: Math.min(supplier.riskBreakdown.delivery + 12, 95),
      reputation: supplier.riskBreakdown.reputation
    },
    simulatedNews,
    recommendations
  };
}

// 9. Server setup
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static server enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SupplyGuard AI custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
