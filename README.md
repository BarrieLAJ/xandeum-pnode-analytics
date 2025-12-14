# Xandeum pNode Analytics

A real-time analytics dashboard for Xandeum pNodes — the storage provider nodes powering Xandeum's scalable storage layer for Solana dApps.

![Xandeum pNode Analytics](https://img.shields.io/badge/Xandeum-pNode%20Analytics-00D4AA?style=for-the-badge)

## Features

### Core Features
- **Live Network Overview**: Real-time KPIs showing total pNodes, RPC coverage, and version distribution
- **pNode Directory**: Searchable, sortable, and filterable table of all pNodes in gossip
- **Node Details**: Deep dive into individual pNode configurations, endpoints, and raw JSON data
- **Side-by-Side Compare**: Compare up to 4 pNodes simultaneously
- **Dark Mode UI**: Modern, accessible interface with a distinctive teal/cyan theme

### Advanced Features
- **RPC Health Probing**: Test each node's RPC endpoint for reachability and latency
- **CSV Export**: Export filtered pNode data to CSV for offline analysis
- **Watchlist**: Save favorite pNodes to localStorage for quick access
- **Geographic Distribution**: View node distribution by country using IP geolocation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Validation**: Zod
- **Language**: TypeScript
- **Icons**: Lucide React

## Data Source

All data is fetched from the Xandeum devnet pRPC endpoint:

```
https://api.devnet.xandeum.com:8899/
```

### pRPC Method Used

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getClusterNodes",
  "params": []
}
```

This returns all pNodes currently participating in the gossip network, including:
- `pubkey` - Unique node identifier
- `version` - Software version
- `featureSet` - Enabled features hash
- `shredVersion` - Consensus protocol version
- Endpoints: `gossip`, `rpc`, `pubsub`, `tpu`, `tpuQuic`, `tpuForwards`, `tpuForwardsQuic`, `tpuVote`, `tvu`, `serveRepair`

## Getting Started

### Prerequisites

- Node.js 18+
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
# Required: The Xandeum pRPC endpoint URL (JSON-RPC 2.0)
XANDEUM_PRPC_URL=https://api.devnet.xandeum.com:8899/

# Optional: Enable per-node RPC probing for health/latency checks (default: false)
ENABLE_RPC_PROBES=false

# Optional: Timeout for pRPC calls in milliseconds (default: 10000)
PRPC_TIMEOUT_MS=10000

# Optional: Snapshot cache TTL in seconds (default: 30)
SNAPSHOT_CACHE_TTL_SECONDS=30
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── pnodes/
│   │       ├── snapshot/route.ts    # GET all pNodes
│   │       ├── [id]/route.ts        # GET single pNode
│   │       ├── probe/route.ts       # RPC health probing
│   │       └── geo/route.ts         # IP geolocation
│   ├── pnodes/
│   │   ├── page.tsx                 # pNode directory
│   │   └── [id]/page.tsx            # pNode detail
│   ├── compare/page.tsx             # Compare nodes
│   ├── about/page.tsx               # Methodology
│   ├── page.tsx                     # Overview/Home
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── app/                         # App-specific components
│   │   ├── AppShell.tsx             # Main layout shell
│   │   ├── MetricCard.tsx           # KPI cards
│   │   ├── PnodeTable.tsx           # Data table with filters
│   │   ├── PnodeDirectory.tsx       # Directory page client component
│   │   ├── GeoDistribution.tsx      # Geographic distribution
│   │   ├── WatchlistButton.tsx      # Watchlist toggle
│   │   ├── StatusBadge.tsx          # Status indicators
│   │   └── CopyButton.tsx           # Copy to clipboard
│   └── ui/                          # shadcn/ui primitives
├── hooks/
│   └── useWatchlist.ts              # Watchlist React hook
├── lib/
│   ├── config/
│   │   └── env.ts                   # Environment validation
│   ├── prpc/
│   │   ├── transport.ts             # JSON-RPC interface
│   │   └── jsonRpcTransport.ts      # HTTP implementation
│   ├── pnodes/
│   │   ├── schemas.ts               # Zod schemas
│   │   ├── model.ts                 # Domain types
│   │   ├── service.ts               # Business logic
│   │   └── probe.ts                 # RPC probing
│   ├── cache/
│   │   └── ttl.ts                   # In-memory cache
│   ├── export/
│   │   └── csv.ts                   # CSV export utilities
│   ├── geo/
│   │   └── lookup.ts                # IP geolocation
│   ├── watchlist/
│   │   └── storage.ts               # localStorage watchlist
│   └── utils.ts                     # Utilities
```

## API Endpoints

### GET /api/pnodes/snapshot

Returns the current snapshot of all pNodes from gossip.

**Query Parameters:**
- `search` - Filter by pubkey/IP/version (partial match)
- `version` - Filter by exact version
- `hasRpc` - Filter by RPC availability (`true`/`false`)
- `sortBy` - Sort field (`pubkey`, `version`, `shredVersion`, `endpointCount`, `ip`)
- `sortOrder` - Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "generatedAt": "2024-01-15T12:00:00.000Z",
  "source": {
    "prpcUrl": "https://api.devnet.xandeum.com:8899/",
    "method": "getClusterNodes"
  },
  "stale": false,
  "fetchDurationMs": 245,
  "rows": [...],
  "stats": {
    "totalNodes": 22,
    "nodesWithRpc": 22,
    "nodesWithPubsub": 22,
    "versionDistribution": { "2.2.0-7c3f39e8": 19, "2.2.0-b5a94688": 3 },
    "uniqueVersions": 2,
    "modalVersion": "2.2.0-7c3f39e8"
  }
}
```

### GET /api/pnodes/[id]

Returns detailed information about a specific pNode.

### GET /api/pnodes/probe

Probes all pNode RPC endpoints for health and latency.

**Query Parameters:**
- `force` - Set to `true` to probe even if disabled in config

**Response:**
```json
{
  "generatedAt": "2024-01-15T12:00:00.000Z",
  "probeDurationMs": 5432,
  "stats": {
    "totalProbed": 22,
    "reachable": 18,
    "unreachable": 4,
    "avgLatencyMs": 145,
    "minLatencyMs": 45,
    "maxLatencyMs": 890
  },
  "rows": [...]
}
```

### GET /api/pnodes/geo

Looks up geographic information for pNode IPs.

**Query Parameters:**
- `limit` - Max number of IPs to lookup (default: 50, max: 100)

## Features in Detail

### RPC Health Probing

Click "Test RPC Health" in the directory to probe each node's RPC endpoint:
- Tests `getHealth` endpoint for each node
- Measures round-trip latency in milliseconds
- Shows reachable/unreachable status
- Displays results in a dedicated column

### CSV Export

Export the current filtered table to CSV:
- Includes all node data (pubkey, version, endpoints)
- Includes probe results if available
- Respects current filters
- Timestamped filename

### Watchlist

Save favorite pNodes for quick access:
- Click the star icon on any node row
- Filter by watched/unwatched
- Persisted in localStorage
- Shown in KPI cards

### Geographic Distribution

View node distribution by country:
- Click "Load Geo Data" on overview page
- Uses free IP-API service (rate-limited)
- Shows country breakdown with visual bars
- Cached for 24 hours

## Caching Strategy

- **Snapshot Cache**: 30-second TTL for the full pNode list
- **Node Detail Cache**: 60-second TTL for individual node data
- **Geo Cache**: 24-hour TTL for IP geolocation results
- **Stale Fallback**: If pRPC is unreachable, cached data is returned with a `stale: true` flag

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/xandeum-pnode-analytics)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- Fly.io
- AWS Amplify
- Self-hosted

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- [Xandeum Website](https://xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Xandeum Explorer](https://explorer.xandeum.com)
- [Superteam Bounty](https://earn.superteam.fun)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the Xandeum & Superteam community
