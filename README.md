# Local Film Rating

Application web personnelle de notation de films avec un système de notation détaillé sur 4 critères.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Fonctionnalités

- **Recherche de films** via l'API TMDB
- **Notation détaillée** sur 4 critères :
  - Scénario
  - Visuel
  - Musique
  - Acting
- **Note globale** calculée automatiquement
- **Système de favoris**
- **Commentaires personnels**
- **Dashboard** avec filtres (récents, mieux notés, favoris)
- **Base de données locale** (JSON)

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) 18+ 
- [PM2](https://pm2.keymetrics.io/) (pour le mode service)
- Une clé API [TMDB](https://www.themoviedb.org/settings/api)

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Arthurfert/Local-Film-rating.git
   cd Local-Film-rating
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Éditez `.env.local` et ajoutez votre clé API TMDB :
   ```env
   TMDB_API_KEY=votre_clé_api_tmdb
   TMDB_API_READ_ACCESS_TOKEN=votre_token_read_access
   ```

4. **Compiler l'application**
   ```bash
   npm run build
   ```

## Utilisation

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

### Mode production (Service en arrière-plan avec PM2)

PM2 permet de faire tourner l'application en arrière-plan, même après fermeture du terminal.

#### Installation de PM2

```bash
npm install -g pm2
npm install -g pm2-windows-startup  # Windows uniquement
```

#### Commandes PM2

| Commande | Description |
|----------|-------------|
| `npm run pm2:start` | Démarrer l'application en arrière-plan |
| `npm run pm2:stop` | Arrêter l'application |
| `npm run pm2:restart` | Redémarrer l'application |
| `npm run pm2:logs` | Voir les logs en temps réel |
| `npm run pm2:status` | Voir le statut de l'application |

#### Commandes PM2 directes

```bash
pm2 status              # Voir tous les processus
pm2 logs film-rating    # Voir les logs
pm2 restart film-rating # Redémarrer
pm2 stop film-rating    # Arrêter
pm2 delete film-rating  # Supprimer le processus
```

#### Démarrage automatique au boot (Windows)

```bash
pm2 save                # Sauvegarder la liste des processus
pm2-startup install     # Activer le démarrage automatique
```

Pour désactiver :
```bash
pm2-startup uninstall
```

## Structure du projet

```
Local-Film-rating/
├── app/                    # Pages et routes Next.js (App Router)
│   ├── api/               # API Routes
│   │   ├── movies/        # Routes TMDB (search, popular, [id])
│   │   └── reviews/       # Routes reviews (CRUD)
│   ├── rate/[id]/         # Page de notation d'un film
│   ├── review/[id]/       # Page détail d'une review
│   ├── search/            # Page de recherche
│   └── page.tsx           # Dashboard principal
├── components/            # Composants React
├── lib/                   # Utilitaires et configurations
│   ├── db.ts             # Base de données locale JSON
│   ├── tmdb.ts           # Client API TMDB
│   └── types.ts          # Types TypeScript
├── data/                  # Stockage des données
│   └── reviews.json      # Base de données des reviews
├── public/               # Assets statiques
└── ecosystem.config.js   # Configuration PM2
```

## Sécurité

- La clé API TMDB n'est **jamais exposée côté client**
- Tous les appels TMDB passent par les API Routes Next.js (serverless)
- Les données sont stockées localement sur votre machine

## License

This project is under an [MIT License](./LICENSE)

---

Données fournies par [TMDB](https://www.themoviedb.org/)