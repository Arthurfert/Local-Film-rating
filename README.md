# Local Film Rating

Personal web application for rating movies and TV shows with a detailed 4-criteria rating system.

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

- [Node.js](https://nodejs.org/) 18+ 
- [PM2](https://pm2.keymetrics.io/) (for service mode)
- A [TMDB](https://www.themoviedb.org/settings/api) API Key

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

The application will be available at http://localhost:3000

### Production Mode with PM2

PM2 allows you to run the application in the background, even after closing the terminal.

#### Install PM2

```bash
npm install -g pm2
npm install -g pm2-windows-startup  # Windows only
```

#### NPM Commands

| Command  | Description |
|----------|-------------|
| `npm run pm2:start` | Start the application in the background |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:restart` | Restart the application |
| `npm run pm2:logs` | View logs in real-time |
| `npm run pm2:status` | View application status |

#### Direct PM2 Commands

```bash
pm2 status              # List all processes
pm2 logs film-rating    # View logs
pm2 restart film-rating # Restart
pm2 stop film-rating    # Stop
pm2 delete film-rating  # Delete the process
```

#### Auto-start on Boot (Windows)

```bash
pm2 save                # Save the process list
pm2-startup install     # Enable auto-start
```

To disable :
```bash
pm2-startup uninstall
```

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
│   ├── tmdb.ts                     # TMDB API client
│   ├── types.ts                    # TypeScript types & interfaces
│   └── utils.ts                    # Helper functions
├── data/                          # Data storage
│   ├── reviews.json                # Reviews database
│   └── watchlist.json              # Watchlist database
├── public/                        # Static assets
├── ecosystem.config.js             # PM2 configuration
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
| PM2 | Process management |
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

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/[id]` - Remove from watchlist

## License

This project is under an [MIT License](./LICENSE)

---

**Data provided by [TMDB](https://www.themoviedb.org/)**

**Created by Arthur Fert**