# 🎬 Jellyfin Audit Dashboard

A visual audit tool for Jellyfin libraries that scans media assets and highlights missing artwork, metadata, and library health issues.

---

## 🚀 Features

- Full Jellyfin library scan
- Missing artwork detection:
  - Primary posters
  - Logos
  - Thumbnails
  - Banners
  - Discs
  - Backdrops (bucketed)
- Netflix-style drilldown UI
- Visual dashboard overview
- Cached scan results for fast browsing
- Drilldown navigation per issue type

---

## 📸 UI Overview

- Dashboard → high-level library health metrics
- Drilldowns → Netflix-style rows of affected items
- Search + sort within each category
- Fast cached loading after scan

---

## 🧠 How It Works

1. `/api/scan` pulls full Jellyfin library
2. `buildMissingIndex()` analyses image coverage
3. Results are stored in `/data/` cache files
4. `/api/cache` serves summary stats
5. `/api/list` serves drilldown groups
6. Frontend renders dashboard + drilldowns

---

## ⚙️ Setup

1. Clone repo

```bash
git clone https://github.com/YOUR_USERNAME/jellyfin-audit-dashboard.git
cd jellyfin-audit-dashboard


2. Install dependencies
npm install

3. Configure environment

Create .env.local:

JELLYFIN_URL=http://your-jellyfin-server:8096
JELLYFIN_API_KEY=your_api_key
JELLYFIN_USER_ID=your_user_id

3. Configure environment

Create .env.local:

JELLYFIN_URL=http://your-jellyfin-server:8096
JELLYFIN_API_KEY=your_api_key
JELLYFIN_USER_ID=your_user_id

4. Run development server
npm run dev

Open:

http://localhost:3000/dashboard
🔄 Running a Scan

Trigger a full scan:

curl http://localhost:3000/api/scan

Or POST:

curl -X POST http://localhost:3000/api/scan
📊 API Endpoints
Endpoint	Description
/api/scan	Runs full Jellyfin scan
/api/cache	Returns summary stats
/api/list?type=	Returns drilldown items
📦 Build
npm run build
npm run start
🧹 Data Handling

All scan results are stored locally in:

/data

This folder is gitignored by design.

🛡️ Security

Never commit:

Jellyfin API keys
.env files
/data cache outputs
📜 License

MIT License

🧭 Roadmap (v2)
Docker support
Background scan worker (overnight mode)
Live progress UI
Thumbnail prefetch optimisation
Enhanced metadata graphing
❤️ Purpose

Built to give Jellyfin libraries a visual health layer — turning metadata completeness into something observable and actionable.