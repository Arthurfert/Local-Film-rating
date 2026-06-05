# Local Film Rating

Local website for rating movies and TV shows, manage your watchlist, and stream content via embedded players.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Features

- **Movie & TV Show Search** via TMDB API
- **Detailed Rating System** on 4 criteria:
  - Story/Scenario
  - Visuals
  - Music/Sound
  - Acting
- **Global Rating** calculated automatically
- **Favorites System**
- **Personal Reviews & Comments**
- **Dashboard** with filters (by watch date, highest rated, favorites)
- **Watchlist** management (add, remove, filter)
- **Streaming** — Watch movies and TV shows via configurable embed provider
- **Season/Episode Selector** for TV shows on the watch page
- **Local Database** (JSON format)
- **Sorting** — by watch date, rating, or date added
- **Media Filtering** — Movies, Animated Films, TV Shows
- **Search functionality** — across all reviews and watchlist

## Installation

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (Recommended for production)
- [Node.js](https://nodejs.org/) 18+ (For development mode)
- A [TMDB API Key](https://www.themoviedb.org/settings/api)
- A streaming provider URL

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arthurfert/Local-Film-rating.git
   cd Local-Film-rating
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your TMDB API credentials and streaming URLs:
   ```env
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token

   STREAM_PROVIDER=embed
   STREAM_MOVIE_URL_PATTERN=https://provider/movie/{id}
   STREAM_TV_URL_PATTERN=https://provider/tv/{id}/{season}/{ep}
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

## Usage

### Development Mode

```bash
npm run dev
```

> [!NOTE]
> The application will be available at http://localhost:3000

### Production Mode with Docker (Recommended)

Docker enhances system isolation and packages all dependencies together securely.

#### Setup & Start

1. Start the container in detached (background) mode:
   ```bash
   npm run docker:up
   ```
   *(This runs `docker compose up -d` under the hood).*

2. View real-time logs:
   ```bash
   npm run docker:logs
   ```

#### NPM Commands

| Command  | Description |
|----------|-------------|
| `npm run docker:build` | Build the application Docker image |
| `npm run docker:up` | Start the container in the background |
| `npm run docker:down` | Stop and remove the container |
| `npm run docker:restart` | Restart the container |
| `npm run docker:logs` | View container logs in real-time |

#### Data & Config persistence
- **Environment variables**: Automatically loaded from `.env.local` at runtime.
- **Database**: All movie ratings and watchlists are stored in `./data` on the host, which is mounted into the container as a persistent volume. You will not lose your data if the container is rebuilt or restarted.

#### Automated Security Updates
We provide a helper script `./update-container.sh` that pulls the latest Node base image, upgrades Alpine OS packages (`apk upgrade`), rebuilds the container without cache to patch any vulnerabilities, and prunes unused images:
```bash
chmod +x update-container.sh
./update-container.sh
```
You can automate this by setting up a cron job (Linux/macOS) or using Windows Task Scheduler to run it periodically (e.g. weekly).

## Project Structure
<details>
    <summary>Project Structure</summary>

```
Local-Film-rating/
├── app/                            # Pages and Next.js routes (App Router)
│   ├── api/                        # API Routes
│   │   ├── movies/                 # TMDB Movie endpoints
│   │   │   ├── [id]/                  # Get movie details
│   │   │   ├── popular/               # Get popular movies
│   │   │   └── search/                # Search movies
│   │   ├── tv/                     # TMDB TV Show endpoints
│   │   │   └── [id]/                  # Get TV show details
│   │   ├── reviews/                # Review Management
│   │   │   ├── route.ts               # List & create reviews
│   │   │   ├── [id]/                  # Update & delete reviews
│   │   │   └── tmdb/[tmdbId]/         # Get review by TMDB ID
│   │   ├── watchlist/              # Watchlist Management
│   │   │   ├── route.ts               # Get & add to watchlist
│   │   │   └── [id]/                  # Remove from watchlist
│   │   ├── stream/                 # Stream URL generation
│   │   │   └── [type]/[id]/           # Get stream URL by type & ID
│   │   └── search/                 # Global search
│   ├── media/[type]/[id]/          # Media details page
│   │   ├── page.tsx                   # Server component (backdrop, poster)
│   │   ├── MediaContent.tsx           # Client component (info, actions, form)
│   │   └── MediaActionsClient.tsx     # Ratings display (rated films)
│   ├── watch/[type]/[id]/          # Streaming player page
│   │   ├── page.tsx                   # Server component (metadata)
│   │   └── WatchClient.tsx            # Client component (player, season/ep selector)
│   ├── watchlist/                  # Watchlist page
│   │   └── page.tsx
│   ├── search/                     # Search results page
│   │   └── page.tsx
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Dashboard
│   └── globals.css                 # Global styles
├── components/                     # React Components
│   ├── DashboardContent.tsx           # Main dashboard content
│   ├── MovieCard.tsx                  # Movie/TV show card component
│   ├── MovieGrid.tsx                  # Grid of movie cards
│   ├── NavBar.tsx                     # Navigation bar
│   ├── RatingForm.tsx                 # Rating form component
│   ├── RatingSlider.tsx               # Custom slider for ratings
│   ├── SearchBar.tsx                  # Search bar component
│   ├── SearchResults.tsx              # Search results display
│   ├── StatsCard.tsx                  # Statistics card
│   ├── VideoPlayer.tsx                # Plyr-based video player (embed + direct)
│   └── OptimizedImage.tsx             # Optimized image component
├── lib/                            # Utilities and configurations
│   ├── db.ts                          # Local JSON database management
│   ├── stream.ts                      # Stream URL generation & config
│   ├── tmdb.server.ts                 # Server-side TMDB API integration
│   ├── tmdb.ts                        # TMDB image URL helpers
│   ├── types.ts                       # TypeScript types & interfaces
│   └── utils.ts                       # Helper functions
├── data/                           # Data storage
│   ├── reviews.json                   # Reviews database
│   └── watchlist.json                 # Watchlist database
├── public/                         # Static assets
├── Dockerfile                      # Docker multi-stage build config
├── docker-compose.yml              # Docker Compose orchestration
├── update-container.sh             # Auto-update shell script
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Project dependencies
```
</details>

## Security

- The TMDB API key is **never exposed to the client**
- All TMDB API calls go through Next.js API Routes (serverless)
- Data is stored locally on your machine
- No external data sharing

## Legal Notice

> [!CAUTION]
> **This application is for educational and personal use only.**

- Local-Film-Rating does not host, store, or distribute any copyrighted content
- All content is sourced from third-party providers and websites
- Users are solely responsible for ensuring they have legal rights to access any content
- The developer does not endorse or encourage copyright infringement
- Users must comply with all applicable laws in their jurisdiction
- Any legal issues should be directed to the actual content providers
- This app functions as a search engine aggregator only
- No copyrighted material is stored on my side

This application is provided "as is" for educational purposes.

The developer:
- Does not claim ownership of any content
- Does not profit from copyrighted material in any way
- Does not control third-party content providers
- Encourages users to support content creators through legal means

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first CSS framework |
| React | UI library |
| TMDB API | Movie & TV show database |
| Docker & Compose | Containerization and process isolation |
| Lucide React | Icon library |
| Plyr | Video player component |

## API Endpoints

<details>
    <summary>API Endpoints</summary>

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/tmdb/[tmdbId]` - Get review by TMDB ID
- `PATCH /api/reviews/[id]` - Update a review
- `DELETE /api/reviews/[id]` - Delete a review

### Movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/[id]` - Get movie details

### TV Shows
- `GET /api/tv/[id]` - Get TV show details

### Global Search
- `GET /api/search` - Search across movies and TV shows

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/[id]` - Remove from watchlist (by UUID or TMDB ID + mediaType)

### Streaming
- `GET /api/stream/[type]/[id]` - Get stream URL (optional `?season=N&ep=N` for TV)
</details>

## License

This project is under an [MIT License](./LICENSE).

---

**Images and data provided by [TMDB](https://www.themoviedb.org/)**
