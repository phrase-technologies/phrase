# =============================================================================
# WEEKLY BACKUP
# =============================================================================

# Get the 7-day old backup from daily folder (60 x 24 x 7 = 10,080 minutes, subtract some catching)
mkdir -p ../../backups/weekly/
find ../../backups/daily/ -type f -mmin +10050 -exec mv {} ../../backups/weekly/ \;

# Clear out anything older than 4 weeks (60 x 24 x 7 x 4 = 40,320 minutes, with some padding)
find ../../backups/weekly/ -type f -mmin +41000 -delete
