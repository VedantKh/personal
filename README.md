# Welcome to my personal website repository

This contains the source code for my website.

## Apple Books highlights sync

/books displays highlights I've enjoyed in the Apple Books I've read so far.

This is done using a small script that exports your Apple Books highlights into `static/data/books-highlights.json`, which powers the `/books` page.

### Requirements

- **macOS** (Apple Books stores its data locally in macOS app container databases)
- Node.js + npm

### Run a manual sync

From the repo root:

```bash
npm run sync-books
```

This will:

- Read Apple Books SQLite databases from `~/Library/Containers/com.apple.iBooksX/Data/Documents/`
- Write the generated JSON to `static/data/books-highlights.json`
- **Preserve spotlight highlights**: The sync automatically saves and restores any `spotlight` flags and `spotlightNote` data

If you need to run a raw sync without preserving spotlight data:

```bash
npm run sync-books-raw
```

### Optional: daily cron sync

A helper script exists to create a daily sync runner:

```bash
bash scripts/setup-cron.sh
```

Then follow the printed instructions to add the generated `daily-sync.sh` script to your `crontab`.

### Troubleshooting

- **No highlights exported**
  - Make sure you actually have highlights in Apple Books.
  - Open Apple Books once before syncing (so the databases exist locally).
- **Permissions / file not found**
  - Apple may restrict access to `~/Library/Containers/...` depending on your macOS privacy settings.
  - Confirm the folders exist:
    - `~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/`
    - `~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/`
