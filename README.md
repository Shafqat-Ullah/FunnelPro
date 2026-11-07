# FunnelPro — Complete Full-Stack Sales Funnel & Page Builder SaaS Platform

> **FunnelPro** is an enterprise-grade, high-converting sales funnel and visual website builder SaaS inspired by ClickFunnels. Built with 100% original branding, modern UI/UX design, and a resilient full-stack MERN architecture.

---

## ⚡ Quick Start (Ready for Live Demo)

### 1. Pre-configured Demo Account Credentials
- **Email:** `demo@funnelpro.io`
- **Password:** `Password123!`
- Or simply click the **"Sign In as Demo Admin (Instant Access)"** button on the login screen.

### 2. Running the Application
```bash
# 1. Run database seed (Pre-populates 4 funnels, 12 templates, 15 contacts, 6 products, 12 orders, 30 days of analytics)
npm run seed

# 2. Run backend server (Port 5000)
npm run server

# 3. In another terminal, run frontend client with Vite (Port 5173)
npm run client
```

*Note: Since the production build is compiled in `client/dist`, running `npm start` starts the Express server which serves both the REST API and the client application on `http://localhost:5000`.*

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB with Mongoose, JWT authentication, bcryptjs, REST APIs |
| **Payment Gateway** | Stripe Test Mode API (Secure payment intents, server-side validation, zero raw card storage) |
| **Email Delivery** | Nodemailer with configurable SMTP credentials and Mailtrap simulation mode |
| **Database Persistence** | Dual-Mode Engine: Seamless native MongoDB Mongoose connection with automatic fallback to high-performance disk-persisted JSON database (`server/data/funnelpro_db.json`) ensuring 100% turnkey reliability for client demonstrations |

---

## 🌟 Major Modules & Functionality

### 1. Complete Authentication & Profile Management
- User registration, login, and secure JWT authorization with Bearer tokens.
- Instant 1-click **Demo Account Access** for evaluation.
- Profile editing (Name, avatar, business name, bio, currency).
- Password change and forgot/reset password recovery workflow.
- In-app notification center tracking real order and lead capture events.

### 2. Main SaaS Performance Command Center
- **Key Performance Indicators:** Gross Revenue, Total Page Hits, Unique Visitors, Total Leads, Conversion Rate, and Average Order Value (AOV).
- **Interactive Recharts Visualizations:** Daily revenue area chart, traffic source breakdown, stage-by-stage funnel drop-off journey.
- **Real Database Records:** Live tables of recent customer orders, recent CRM contacts, and top-performing funnel rankings.

### 3. Funnel Builder & Visual Journey Flow
- Full Funnel CRUD (Create, Edit, Rename, Duplicate, Delete).
- Multi-step funnel journey manager supporting **10 Funnel Step Types**:
  1. Opt-in Page
  2. Sales Landing Page
  3. Checkout Page
  4. Order Confirmation Page
  5. Upsell Page
  6. Downsell Page
  7. Thank You Page
  8. Webinar Registration Page
  9. Webinar Sales Page
  10. Lead Generation Page
- **Visual Journey Flow Diagram:** Graphical canvas showing step-by-step customer flow with conversion rates per step.
- Step reordering (Move Up / Down) and individual step URL slugs.
- Funnel publishing controls (Draft / Published toggles).

### 4. Visual Drag-and-Drop Page Builder Studio
- **3-Panel Studio Interface:**
  - **Left Palette:** 16+ Element blocks (Headings, Paragraphs, Buttons, Badges, Opt-in Forms, Countdown Timers, Images, Videos, Testimonials, Pricing Tables, FAQs, Product Cards, Custom HTML) and pre-built section presets (Hero, Opt-in Box, Social Proof).
  - **Center WYSIWYG Canvas:** Responsive viewport switchers (**Desktop 100%**, **Tablet 768px**, **Mobile 390px**), click-to-select, inline action toolbar (move up/down, duplicate, delete), and full Live Preview mode.
  - **Right Property Inspector:** Deep design controls (Typography, Font Size, Colors, Background, Border Radius, Margin/Padding sliders, Alignment, Width/Height).
- **Real-Time Database Persistence:** Saves structured JSON page canvas tree directly to MongoDB.
- **Undo / Redo History Stack:** Native state snapshot tracking with `Ctrl+Z` support.
- **1-Click Live Publishing:** Instantly publishes page to public runtime URL.

### 5. 12 High-Converting Starter Templates Library
- Categorized across **12 Niche Categories**: SaaS, E-commerce, High-Ticket Coaching, Fitness, Real Estate, Restaurant, Healthcare, Webinar, Digital Products, Lead Generation, Agency, Corporate Business.
- Template details, category filters, search bar, and live modal preview.
- **1-Click "Use Template" Cloner:** Duplicates template into a fully functioning 3-step funnel ready for custom branding.

### 6. Contact Management / CRM
- Search and filter contacts by status (Lead vs. Paying Customer) and tags.
- Detailed contact drawer with purchase history, lifetime value, and timestamped activity log.
- **Automatic Lead Capture:** Public funnel opt-in forms automatically upsert contacts into MongoDB CRM.
- Full CSV export functionality (`funnelpro_contacts.csv`).

### 7. Email Marketing & Broadcasts
- Campaign creator with title, subject, preview text, and email body composer.
- Audience segmentation targeting specific contact tags.
- Test email delivery dispatcher via Nodemailer with SMTP verification status badge.
- Open rate and click-through analytics tracking.

### 8. Marketing Automations
- Visual interactive node-based workflow builder.
- Supported **Triggers**: Contact Submits Opt-in Form, Purchase Completed, Tag Added.
- Supported **Actions**: Send Email Broadcast, Add Tag, Remove Tag, Time Delay, Notify Admin.
- Workflow execution counters and active/paused state toggles.

### 9. Products, Order Bumps & 1-Click Upsells
- Product management with pricing, compare-at price, and product types (Digital, Physical, Service).
- **Order Bump Offer Box:** Highly visible checkbox on checkout page (+price) that increases Average Order Value.
- **1-Click Upsell Step:** Post-purchase upgrade offer that seamlessly adds to existing customer orders.

### 10. Checkout & Stripe Test Mode Payments
- Secure payment intent generation and server-side payment verification.
- Promotional coupon engine supporting percentage discounts, fixed dollar discounts, minimum spend, and redemption limits (`LAUNCH20`, `VIP50OFF`, `SAVE10`).
- Test card simulator accepting `4242 4242 4242 4242`.
- Customer order receipts with unique order numbers (`ORD-XXXXXX`).

### 11. Custom Domains & DNS Verification
- Custom domain connection with step-by-step CNAME and TXT record setup instructions.
- Simulated and real DNS verification check with automated Let's Encrypt SSL certificate status badges.

### 12. Integrations Hub
- Ready-to-configure connection cards for **Stripe**, **PayPal**, **Mailchimp**, **Google Analytics 4**, **Meta Pixel**, **SMTP**, and **Outgoing Webhooks**.
- Credential storage and live connection testing.

### 13. Public Funnel Runner (`/f/:funnelSlug/:stepSlug`)
- Publicly accessible funnel runtime rendering published pages dynamically.
- Working interactive opt-in form that captures real leads and advances to next step.
- Working interactive checkout with plan selection, order bump checkbox, coupon redemption, and Stripe test card processing.
- Celebration confetti animation upon successful order completion!

---

## 🔒 Security & Code Standards
- Bcrypt password hashing (10 salt rounds).
- JWT signed sessions with configurable expiration.
- Ownership checks on user resources and protected REST endpoints.
- Strict input validation and centralized Express error handling.
- Zero storage of raw credit card numbers.
- Responsive mobile layout tested across 375px, 390px, 768px, 1024px, and 1440px.

---

## 📁 Repository Directory Structure

```
ClickFunnel/
├── server/
│   ├── config/          # MongoDB connection & Stripe config
│   ├── controllers/     # 12 REST API controllers
│   ├── middleware/      # JWT protect & error middleware
│   ├── models/          # 15 database models (User, Funnel, Step, Page, Contact, etc.)
│   ├── routes/          # Express API route declarations
│   ├── seed/            # Comprehensive demo dataset generator
│   ├── utils/           # Database adapter & Nodemailer dispatcher
│   ├── data/            # Local JSON persistence store
│   └── server.js        # Express app entry point
│
├── client/
│   ├── src/
│   │   ├── api/         # Axios client and modular API services
│   │   ├── components/  # Layout, Page Builder Studio, Modals, Buttons
│   │   ├── context/     # AuthContext & ThemeContext
│   │   └── pages/       # 16 complete SaaS views & public funnel runner
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

© 2026 FunnelPro SaaS Platform. All rights reserved.

