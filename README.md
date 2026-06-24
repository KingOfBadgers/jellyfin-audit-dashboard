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
3. Results are stored in `/app/data/` cache files
4. `/api/cache` serves summary stats
5. `/api/list` serves drilldown groups
6. Frontend renders dashboard + drilldowns

---

## ⚙️ Deployment & Setup

You can run this application either natively for development or completely containerized via Docker/Portainer.

### Method A: Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/jellyfin-audit-dashboard.git](https://github.com/YOUR_USERNAME/jellyfin-audit-dashboard.git)
   cd jellyfin-audit-dashboard

Copy the example environment file and fill in your Jellyfin details:Bashcp .env.example .env

Note: Do not use localhost for JELLYFIN_URL if running inside Docker. Use your host machine's actual local network IP (e.g., http://192.168.1.50:8096).
Set permissions for the local volume:To prevent Docker permission blocks (EACCES) when creating the cache directory, ensure your host storage aligns with user 1000:

Bash
sudo chown -R 1000:1000 /var/lib/docker/volumes/jellyfin_audit_data/_data

Launch the container:Bashdocker compose up -d --build

Open your browser to: http://localhost:8098

Method B: Portainer Stack (Web Editor)Paste the following YAML configuration directly into your Portainer Stack web editor:

YAML

version: '3.8'

services:
  jellyfin-audit:
    image: jellyfin-audit:latest
    container_name: jellyfin-audit-app
    user: "1000:1000"  # Ensures smooth volume file writes
    restart: unless-stopped
    ports:
      - "8098:8098"
    environment:
      - NODE_ENV=production
      - JELLYFIN_URL=http://YOUR_SERVER_IP:8096  # Change to your real Jellyfin IP
      - JELLYFIN_API_KEY=your_api_key_here
      - JELLYFIN_USER_ID=your_user_id_here
    volumes:
      - jellyfin_audit_data:/app/data
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  jellyfin_audit_data:


Method C: 
Native Development
Clone the repository and install dependencies:

Bash
git clone [https://github.com/YOUR_USERNAME/jellyfin-audit-dashboard.git](https://github.com/YOUR_USERNAME/jellyfin-audit-dashboard.git)
cd jellyfin-audit-dashboard
npm install

Create a .env.local file in the root directory:

Code snippet

JELLYFIN_URL=http://your-jellyfin-server:8096
JELLYFIN_API_KEY=your_api_key
JELLYFIN_USER_ID=your_user_id
NEXT_PUBLIC_JELLYFIN_URL=http://192.168.1.X:8096

Start the local development server:
Bash
npm run dev

Open your browser to: http://localhost:3000🔄 

Running a ScanOnce your app is running, you can trigger a full library crawl to populate the dashboard metrics.

Trigger via terminal:Bashcurl http://localhost:8098/api/scan
Or execute a POST request:Bashcurl -X POST http://localhost:8098/api/scan


🧹 Data Handling
All generated scan results are stored persistently in:/app/data
This folder is safely .gitignored by design so that your cache files are never accidentally checked into source control.

🛡️ Security
Never commit your actual configuration values. Ensure your tracking system ignores:Jellyfin API Keys / User IDs.env and .env.local filesActive /data cache outputs

📜 License
Distributed under the MIT License.

❤️ PurposeBuilt to give Jellyfin libraries a visual health layer — turning metadata completeness into something observable, quantifiable, and easily actionable.