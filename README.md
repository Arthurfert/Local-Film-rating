# Local Film Rating

Local website for rating movies and TV shows, and save your watchlist.

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
- **Local Database** (JSON format)
- **Sorting** - by watch date, rating, or date added
- **Media Filtering** - Movies, Animated Films, TV Shows
- **Search functionality** - across all reviews and watchlist

## Installation

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (Recommended for production)
- [Node.js](https://nodejs.org/) 18+ (For development mode)
- A [TMDB API Key](https://www.themoviedb.org/settings/api)

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
   
   Edit `.env.local` and add your TMDB API credentials :
   ```env
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token
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

```
Local-Film-rating/
├── app/                           # Pages and Next.js routes (App Router)
│   ├── api/                       # API Routes
│   │   ├── movies/                # TMDB Movie endpoints
│   │   │   ├── [id]/               # Get movie details
│   │   │   ├── popular/            # Get popular movies
│   │   │   └── search/             # Search movies
│   │   ├── tv/                    # TMDB TV Show endpoints
│   │   │   └── [id]/               # Get TV show details
│   │   ├── reviews/               # Review Management
│   │   │   ├── route.ts            # List & create reviews
│   │   │   ├── [id]/               # Update & delete reviews
│   │   │   └── tmdb/[tmdbId]/      # Get review by TMDB ID
│   │   ├── watchlist/             # Watchlist Management
│   │   │   ├── route.ts            # Get watchlist
│   │   │   └── [id]/               # Add/remove from watchlist
│   │   └── search/                # Global search
│   ├── rate/[id]/                 # Movie rating page
│   │   ├── page.tsx
│   │   └── RatingFormClient.tsx
│   ├── rate-tv/[id]/              # TV show rating page
│   │   ├── page.tsx
│   │   └── TVRatingFormClient.tsx
│   ├── review/[id]/               # Review detail page
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   └── DeleteReviewButton.tsx
│   ├── watchlist/                 # Watchlist page
│   │   └── page.tsx
│   ├── search/                    # Search results page
│   │   └── page.tsx
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Dashboard
│   └── globals.css                # Global styles
├── components/                    # React Components
│   ├── DashboardContent.tsx        # Main dashboard content
│   ├── MovieCard.tsx               # Movie/TV show card component
│   ├── MovieGrid.tsx               # Grid of movie cards
│   ├── NavBar.tsx                  # Navigation bar
│   ├── RatingForm.tsx              # Rating form component
│   ├── RatingSlider.tsx            # Custom slider for ratings
│   ├── SearchBar.tsx               # Search bar component
│   ├── SearchResults.tsx           # Search results display
│   └── StatsCard.tsx               # Statistics card
├── lib/                           # Utilities and configurations
│   ├── db.ts                       # Local JSON database management
│   ├── tmdb.server.ts              # Server-side TMDB API integration
│   ├── tmdb.ts                     # TMDB API client hooks/types
│   ├── types.ts                    # TypeScript types & interfaces
│   └── utils.ts                    # Helper functions
├── data/                          # Data storage
│   ├── reviews.json                # Reviews database
│   └── watchlist.json              # Watchlist database
├── public/                        # Static assets
├── Dockerfile                      # Docker multi-stage build config
├── docker-compose.yml              # Docker Compose orchestration
├── update-container.sh             # Auto-update shell script
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Project dependencies
```

## Security

- The TMDB API key is **never exposed to the client**
- All TMDB API calls go through Next.js API Routes (serverless)
- Data is stored locally on your machine
- No external data sharing

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

## API Endpoints

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/tmdb/[tmdbId]` - Get review by TMDB ID
- `PUT /api/reviews/[id]` - Update a review
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
- `DELETE /api/watchlist/[id]` - Remove from watchlist

## License

This project is under an [MIT License](./LICENSE).

---

**Images and data provided by [TMDB](https://www.themoviedb.org/)**
