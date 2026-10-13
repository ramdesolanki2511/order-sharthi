# OrderSaathi (ઓર્ડરસાથી) — AI Wholesale Business Management

OrderSaathi is a production-oriented mobile and web application engineered specifically for Indian textile traders, garment manufacturers, wholesalers, and distributors (Ahmedabad, Surat, Rajkot, and Pan-India trading hubs).

It streamlines customer orders, catalogue inventory, double-entry customer ledgers, payment tracking, dispatches, and **AI WhatsApp Message-to-Order** parsing into one unified system.

---

## 🚀 Key Features

1. **WhatsApp Message-to-Order AI (Core Differentiator)**
   - Paste informal WhatsApp customer chats (e.g. *"Patel Traders Surat: 50 pcs Rayon Kurti Blue size M, 20 pcs Cotton Bandhani Saree Maroon, urgent dispatch by Friday"*).
   - Server-side Gemini AI (`gemini-3.8-flash`) automatically parses line items, quantities, and sizes, matches your product catalogue, and flags missing rates or unknown products.
   - 100% human-in-the-loop: interactive review table before confirming the order.
   - Built-in heuristic fallback engine ensuring zero downtime even if AI keys are unavailable.

2. **Multilingual Interface (Gujarati, Hindi, English)**
   - Instant language switching across all screens, buttons, and invoices.
   - Unicode-optimized typography for Gujarati (ગુજરાતી) and Devanagari Hindi (हिन्दी).
   - Generates WhatsApp order confirmation messages in the customer's native language.

3. **Complete Order Lifecycle & GST Accounting**
   - Status tracking: Draft → Pending → Confirmed → Processing → Ready for Dispatch → Dispatched → Delivered.
   - Automatic 5% GST calculation for textiles/garments, shipping, and discount application.
   - Repeat / duplicate previous customer orders in 1 click.
   - Reversible stock cancellation with audit safeguards.

4. **Customer Ledger & Receivables Management (Khata)**
   - Double-entry balance calculation: Invoices (Debit), Payments (Credit), Running Balance.
   - Supports Cash, UPI (with UTR), Bank Transfer (NEFT/RTGS), and Cheques.
   - Overdue payment reminders with 1-tap WhatsApp reminder link.

5. **Inventory & Backorder Protection**
   - Stock-in (mill purchase/production) and Stock-out (sales/samples) audit logging.
   - Prevents negative inventory unless the owner explicitly turns on backorders in Settings.
   - Low-stock threshold alerts.

6. **Logistics & Dispatch Tracking**
   - Log transporter name (e.g., Surat Golden Transport, VRL Logistics), LR/Bilty numbers, parcel count, and expected delivery date.
   - 1-tap WhatsApp LR share with customers.

7. **Printable B2B Tax Invoice**
   - Compliant B2B invoice format with GSTIN, HSN codes, CGST/SGST tax split, and bank account / UPI QR details.

8. **SaaS Monetization Engine**
   - Configurable subscription tiers: Free Trial (14-day), Starter (₹499/mo), Pro (₹999/mo), Business (₹1,499/mo).
   - Role-based permissions: Business Owner, Manager, Staff Member.

---

## 📂 Project Architecture

```
├── /server.ts                           # Full-stack Express backend with Vite middleware
├── /src
│   ├── /components
│   │   ├── /screens
│   │   │   ├── DashboardScreen.tsx      # Live financial metrics & quick actions
│   │   │   ├── OrdersScreen.tsx         # Wholesale orders list & filters
│   │   │   ├── CreateOrderModal.tsx     # Order creation with itemized rates
│   │   │   ├── OrderDetailsModal.tsx    # Order stepper & WhatsApp summary generator
│   │   │   ├── WhatsAppImportModal.tsx  # Signature AI WhatsApp order parser
│   │   │   ├── CustomersScreen.tsx      # Customer master with balance dues
│   │   │   ├── CustomerProfileModal.tsx # Running ledger & AI reorders
│   │   │   ├── CustomerFormModal.tsx    # Customer creation with credit limit & GSTIN
│   │   │   ├── ProductsScreen.tsx       # Inventory catalogue & low stock alerts
│   │   │   ├── ProductFormModal.tsx     # Add/edit product with AI aliases
│   │   │   ├── StockAdjustmentModal.tsx # Stock-in/out audit with backorder guard
│   │   │   ├── PaymentsScreen.tsx       # Payment receipts & ledger entries
│   │   │   ├── RecordPaymentModal.tsx   # Record UPI, Cash, Bank receipts
│   │   │   ├── DispatchScreen.tsx       # Transporter & Bilty LR tracking
│   │   │   ├── DispatchModal.tsx        # Add dispatch record
│   │   │   ├── ReportsScreen.tsx        # Sales analytics & CA CSV exports
│   │   │   ├── FollowUpsScreen.tsx      # Payment collection reminders
│   │   │   ├── SubscriptionScreen.tsx   # SaaS subscription & plan upgrade
│   │   │   ├── SettingsScreen.tsx       # Firm profile, backorders, and roles
│   │   │   ├── InvoiceModal.tsx         # Printable B2B GST tax invoice
│   │   │   └── OnboardingTourModal.tsx  # 4-step guided onboarding walkthrough
│   │   └── /ui
│   │       ├── Header.tsx               # Top bar with role switch & language selector
│   │       ├── BottomNav.tsx            # Mobile 5-tab navigation bar
│   │       └── DeviceFrame.tsx          # Smartphone preview & web toggle
│   ├── /context
│   │   └── AppContext.tsx               # Multi-tenant state engine with LocalStorage
│   ├── /i18n
│   │   └── translations.ts              # Gujarati, Hindi, and English dictionaries
│   ├── /theme
│   │   └── index.ts                     # Design tokens & status indicators
│   ├── /types
│   │   └── index.ts                     # Strict TypeScript data models
│   ├── /tests
│   │   └── unit-tests.ts                # Unit tests for calculations, ledger, & RBAC
│   ├── App.tsx                          # App root combining all screens & modals
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Tailwind CSS styles & typography
├── /supabase
│   ├── /migrations
│   │   ├── 20261013000000_ordersaathi_schema.sql  # Complete PostgreSQL schema
│   │   └── 20261013000001_ordersaathi_rls.sql     # Multi-tenant RLS security policies
│   └── seed.sql                         # Gujarat textile market seed records
├── package.json                         # Scripts & dependencies
└── tsconfig.json                        # TypeScript configuration
```

---

## 🛠️ Local Development & Running the App

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

3. **Compile & Type Check**:
   ```bash
   npm run lint
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🗄️ Supabase PostgreSQL Setup & Deployment

1. Create a project at [supabase.com](https://supabase.com).
2. Under **SQL Editor**, execute the migration files in order:
   - Run `supabase/migrations/20261013000000_ordersaathi_schema.sql`
   - Run `supabase/migrations/20261013000001_ordersaathi_rls.sql`
3. Load demo sample data for Gujarat textile trading:
   - Run `supabase/seed.sql`
4. Copy your project URL and public anon key into `.env`.

---

## 📱 Mobile App (Expo & React Native) Deployment

To compile OrderSaathi into native Android (`.apk` / `.aab`) and iOS (`.ipa`) applications:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Initialize EAS Project**:
   ```bash
   eas build:configure
   ```

3. **Build for Android**:
   ```bash
   # Development APK for local phone testing:
   eas build --platform android --profile preview

   # Production AAB for Google Play Store:
   eas build --platform android --profile production
   ```

4. **Build for iOS**:
   ```bash
   # Development build:
   eas build --platform ios --profile preview

   # Production build for App Store:
   eas build --platform ios --profile production
   ```

---

## 🔒 Security & Data Isolation
- **Tenant Isolation**: Every database query filters by `business_id` enforced at the database level via PostgreSQL Row Level Security (RLS).
- **Role Enforcement**: Business Owner has full billing and delete rights; Managers can modify stock and orders; Staff can only record orders and view catalog.
- **Server-Side AI**: Gemini API calls are strictly handled on the server side in `/server.ts` without exposing API keys to the client browser.
