#!/bin/bash

# Apple Books Highlights Cron Job Setup
# This script sets up a daily cron job to sync Apple Books highlights
# and optionally rebuild/deploy the website.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📅 Setting up Apple Books highlights sync cron job..."
echo ""

# Create the sync script that cron will run
SYNC_SCRIPT="$SCRIPT_DIR/daily-sync.sh"

cat > "$SYNC_SCRIPT" << 'EOF'
#!/bin/bash

# Daily Apple Books Sync Script
# Runs the extraction and optionally commits to git

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Log file for debugging
LOG_FILE="$SCRIPT_DIR/sync.log"

echo "=== Sync started at $(date) ===" >> "$LOG_FILE"

# Run the extraction script
/usr/local/bin/node scripts/extract-apple-books.js >> "$LOG_FILE" 2>&1

# Check if there are changes
if git diff --quiet static/data/books-highlights.json; then
    echo "No changes to highlights" >> "$LOG_FILE"
else
    echo "Changes detected, committing..." >> "$LOG_FILE"
    git add static/data/books-highlights.json
    git commit -m "chore: sync Apple Books highlights $(date +%Y-%m-%d)" >> "$LOG_FILE" 2>&1
    
    # Uncomment to auto-push (requires SSH key setup)
    # git push >> "$LOG_FILE" 2>&1
fi

echo "=== Sync completed at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
EOF

chmod +x "$SYNC_SCRIPT"

echo "Created daily sync script: $SYNC_SCRIPT"
echo ""

# Show the cron entry to add
CRON_ENTRY="0 9 * * * $SYNC_SCRIPT"

echo "To set up the daily cron job, run:"
echo ""
echo "  crontab -e"
echo ""
echo "And add this line (syncs every day at 9 AM):"
echo ""
echo "  $CRON_ENTRY"
echo ""
echo "Or run this command to add it automatically:"
echo ""
echo "  (crontab -l 2>/dev/null; echo \"$CRON_ENTRY\") | crontab -"
echo ""
echo "✅ Setup complete!"
