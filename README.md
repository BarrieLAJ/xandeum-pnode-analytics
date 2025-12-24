# Xandeum pNode Analytics

A real-time dashboard for monitoring Xandeum pNodes — the storage nodes that power Xandeum's scalable storage layer for Solana dApps.

## Features

### Core Features

- **pNode Directory**: Browse all pNodes in a searchable, sortable table with filters for version, RPC status, and watchlist
- **Node Details**: Deep dive into individual pNodes with system stats (CPU, RAM, network, active streams), historical charts, endpoints, and raw data
- **Compare Nodes**: Side-by-side comparison of up to 4 pNodes simultaneously
- **Watchlist**: Save favorite pNodes to localStorage for quick access
- **RPC Health Probing**: Test each node's RPC endpoint for reachability and latency
- **CSV Export**: Export filtered pNode data to CSV for offline analysis

### Analytics & Visualization

- **Performance Charts**: Version distribution, RPC distribution, endpoint distribution, and latency analysis
- **Network History**: Track network metrics over time (24h, 7d, 30d) with interactive charts
- **Geographic Visualization**: World map with node markers and country/city distribution breakdowns
- **KPI Dashboard**: Real-time metrics including total nodes, public nodes, storage committed, and average uptime

### Advanced Features

- **Historical Data**: Optional database integration for tracking network and pod stats over time
- **Credits Tracking**: View credits for all pods from the Xandeum Credits API
- **Cron Ingestion**: Automated snapshot collection for historical analysis (optional)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Charts**: Recharts
- **Validation**: Zod
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/xandeum-pnode-analytics.git
cd xandeum-pnode-analytics

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Optional: Explicit pRPC URL override
# If set, this will be used instead of XANDEUM_PRPC_SEEDS
XANDEUM_PRPC_URL=https://api.devnet.xandeum.com:8899/

# Optional: Comma-separated list of seed pNode hosts/URLs
# Defaults to a list of known seed nodes if not provided
XANDEUM_PRPC_SEEDS=173.212.203.145,192.190.136.36

# Optional: Enable per-node RPC probing for health/latency checks
# Default: false
ENABLE_RPC_PROBES=false

# Optional: Timeout for pRPC calls in milliseconds
# Default: 15000
PRPC_TIMEOUT_MS=15000

# Optional: Maximum number of seed pNodes to query (for performance)
# Default: 4
PRPC_MAX_SEEDS=4

# Optional: Snapshot cache TTL in seconds
# Default: 30
SNAPSHOT_CACHE_TTL_SECONDS=30

# Optional: Database connection string for historical data
# Required only if you want to use historical tracking features
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Optional: Secret for cron ingestion endpoint protection
# Required only if using the cron ingestion feature
CRON_SECRET=your-secret-key-here

# Optional: Base URL for IP geolocation service
# Default: http://ip-api.com
GEOLOOKUP_BASE_URL=http://ip-api.com
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Database Setup (Optional)

If you want to use historical data tracking:

```bash
# Run database migrations
pnpm db:setup
```

## Data Source

Data is fetched from Xandeum pRPC endpoints using the `get-pods-with-stats` method. The dashboard queries multiple seed nodes to discover all pNodes in the gossip network, including their identifiers, versions, endpoints, storage stats, system metrics, and credits.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── pnodes/          # pNode API endpoints
│   │   ├── history/          # Historical data endpoints
│   │   └── cron/             # Cron ingestion endpoints
│   ├── pnodes/               # pNode directory and detail pages
│   ├── compare/              # Node comparison page
│   └── about/                # About page
├── components/
│   ├── shared/               # Shared components (AppShell, MetricCard, etc.)
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── config/               # Environment configuration
│   ├── prpc/                 # pRPC transport layer
│   ├── pnodes/               # pNode domain logic
│   ├── db/                   # Database queries and schema
│   ├── cache/                # Caching utilities
│   └── query/                # React Query setup
└── scripts/                  # Utility scripts
```

## Deployment

Deploy to Vercel, Netlify, Railway, or any platform that supports Next.js. Set your environment variables in your deployment platform's settings.

## Resources

- [Xandeum Website](https://xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Xandeum Explorer](https://explorer.xandeum.com)

## License

MIT License
