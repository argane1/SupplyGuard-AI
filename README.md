# 🚀 SupplyGuard AI

**SupplyGuard AI** is an enterprise-grade supply chain intelligence platform built with **React 19**, **TypeScript**, and **Express.js**. It provides real-time risk monitoring, geographic vulnerability mapping, supplier dossier analysis, AES-256 encrypted security management, federated data architecture visualization, and multi-tier enterprise subscription plans — all wrapped in a responsive, cyber-security-themed UI inspired by Palantir and Bloomberg Terminal aesthetics.

---

## 📦 Technologies

- **React 19** — Frontend framework with component-based architecture
- **TypeScript** — Type-safe development across frontend and backend
- **Vite** — Fast build tool for HMR, dev server, and production builds
- **Tailwind CSS v4** — Utility-first responsive styling engine
- **Express.js** — Lightweight Node.js server handling REST APIs
- **@google/genai** — Gemini AI SDK for supplier risk analysis & insights
- **lucide-react** — Clean, consistent icon library throughout the app
- **motion** — Smooth animation and transition effects
- **Mapbox GL JS** — Interactive geographic vulnerability map with geo-positioned pins

---

## 🦄 Features

Here's what you can do with **SupplyGuard AI**:

**📊 Real-Time Operations Terminal:** Monitor all active supply chain suppliers at a glance. Each supplier risk scorecard displays the entity name, country of origin, calculated risk score (0–100), and color-coded risk level indicator — instantly identifying which partners need attention.

**🗺️ Interactive Vulnerability Map:** Explore supplier locations across the globe on an embedded Mapbox GL map. Pins are geo-positioned using real-world lat/lng coordinates from each supplier record, with colors matching their current risk severity (Low → Green, Medium → Amber, Critical → Red).

**📋 Intelligence Dossiers:** Inspect detailed intelligence profiles for every sourced supplier. The profile view includes AI-calculated vulnerability breakdown metrics across five dimensions — News, Market Volatility, Regulation, Delivery Choke, and Reputational Risk — plus core products, enterprise profile info, assigned mitigation protocols, and a secure provisioning form for enlisting new supply chain partners.

**🔐 Cipher Crypt & Logs:** Manage the platform's AES-256 encryption infrastructure from a single security center panel. View master key status (active/rotated), rotate encryption keys with one click, issue or revoke API client tokens tied to specific authorization roles (Risk Analyst, Supply Chain Director, Security Admin), and review an immutable audit log of every action performed on the system.

**🏗️ Architecture & Schema:** Visualize the entire federated data pipeline from multiple enterprise sources — SAP ERP pipelines, Bloomberg Terminal feeds, custom sovereign intelligence — through a TLS 1.3 API Shield sanitizer into an isolated in-memory database with immutably logged crypt-logs and table schemas for `suppliers`, `audit_logs`, and `client_tokens`.

**💰 Enterprise Subscription:** Browse three corporate license tiers (Corporate Base at $4,500/month, Operations Global at $12,000/month, and Federated Custom with a custom quote) — each offering progressively greater capacity, AI diagnostics, key rotation, live API links, and dedicated cyber defense support.

---

## ⏳ The Process

The project began by scaffolding a React + TypeScript Vite application with Tailwind CSS v4 for styling and Express.js as the backend server. A seed data layer was established in-memory on the Express side — populating six realistic suppliers (spanning semiconductors, logistics, chemicals, raw materials, packaging) across Asia-Pacific, Europe, Australia, and South America, along with three sample API keys and an initial audit log history.

Next, the frontend was structured around a sidebar-driven navigation system with six distinct tabs managed through React state (`activeTab`). The **Operations Terminal** (dashboard tab) became the first interactive screen — pulling live supplier data from the backend `/api/suppliers` endpoint via `fetch()` and rendering each supplier's risk score, country flag, and color-coded risk badge alongside their five-dimension breakdown. A dedicated alert panel surfaced critical suppliers whose delivery choke metric exceeded 80%, displaying cascading vulnerability warnings with AI-generated mitigations.

The **Vulnerability Map** was then implemented using the `mapbox-gl` library. Supplier records were mapped to geographic pins by reading each supplier's embedded lat/lng values, and pins were color-coded according to risk level so users could visually identify hotspots at a glance. The map also supports zoom interactions for closer inspection of regional clusters.

The **Intelligence Dossiers** tab provided the deepest dive into supplier intelligence. The profile view was split into two columns: a scrollable directory listing all suppliers on the left (each clickable to open its dossier), and a large right panel that renders full details — including enterprise info, core physical products, AI-calculated risk breakdown bars with percentage values, assigned mitigation protocols, and a secure provisioning modal for enlisting new supply chain partners.

The **Cipher Crypt & Logs** security center was built next — displaying the AES-256 master key status in a dark-themed panel, offering an "Rotate Master Key" button that triggers a simulated AES rotation with a fresh fingerprint generated via SHA-256 hashing, and managing API client tokens through create/revoke forms. An immutable audit log feed showed every action taken on the platform — including user identity, timestamped actions, and role-based context.

The **Architecture & Schema** tab wrapped up the core technical content by rendering a visual flowchart of the federated data pipeline (data feeds → TLS 1.3 API Shield sanitizer → AES envelope seal → Cipher Crypt database), followed by three inline table schemas showing column definitions for `suppliers`, `audit_logs`, and `client_tokens` — giving developers full visibility into the in-memory relational structure.

Finally, UI polish was applied throughout: Tailwind CSS v4 utility classes provided responsive layouts that adapt across desktop and tablet screens; Lucide React icons were used consistently for all navigation items and section headers; motion animations added subtle hover effects to buttons and cards; keyboard accessibility was ensured via semantic HTML elements and focusable components. The project concluded with a comprehensive README documenting the architecture, features, technologies, and development process — completing the full engineering lifecycle from concept through documentation.

---

## 🧠 What I Learned

During this project, I've picked up important skills and a better understanding of complex ideas, which improved my logical thinking.

### 🧠 React State Management with Context & Custom Hooks:
**Key Skill:** Managing global application state efficiently across multiple components using React's Context API and custom hooks like `useMemo` for performance optimization.

**What I learned:** I discovered how to create a centralized context provider that distributes supplier data, security status, and audit logs throughout the component tree without prop drilling. This pattern significantly reduced code duplication and made state updates more predictable when handling concurrent user interactions across different dashboard tabs.

### 🧠 TypeScript Generics & Interface Design:
**Key Skill:** Defining robust type contracts with interfaces like `Supplier`, `Alert`, and `AuditLog` while leveraging generics for reusable components.

**What I learned:** By strictly typing all data models upfront, I caught runtime errors before they reached production — especially when handling edge cases like null suppliers or malformed API responses. The TypeScript compiler became my safety net during rapid UI iteration.

### 🧠 Express.js Middleware & REST API Design:
**Key Skill:** Building a modular backend with middleware pipelines for request validation and error handling, plus clean HTTP verb routing (GET/POST endpoints).

**What I learned:** Structuring routes by resource (`/api/suppliers`, `/api/security-status`) taught me how to separate concerns cleanly — keeping server logic decoupled from UI rendering. The `express.json()` middleware pattern also demonstrated why proper content-type parsing matters for production APIs.

### 🧠 Tailwind CSS v4 Utility Classes:
**Key Skill:** Using utility-first styling with responsive breakpoints, dark mode variants, and custom color palettes to build pixel-perfect cyber-security themed interfaces.

**What I learned:** Tailwind's JIT compiler eliminated unused CSS at build time while providing a consistent design system — from `bg-slate-950` for security panels to `text-emerald-400` for active status indicators. This approach kept the UI cohesive without manual style sheets.

### 🧠 Mapbox GL JS Geographic Visualization:
**Key Skill:** Rendering interactive maps with geo-positioned pins, custom styling based on data attributes, and zoom/pan interactions for intuitive exploration.

**What I learned:** Integrating Mapbox taught me how to translate real-world lat/lng coordinates into meaningful visual representations — color-coding supplier risk levels directly onto the map created instant geographic context that tables alone couldn't convey.