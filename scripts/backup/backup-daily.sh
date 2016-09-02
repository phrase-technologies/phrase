# =============================================================================
# DAILY BACKUP
# =============================================================================

# Get the 24-hour old backup from hourly folder (60 x 24 = 1440 minutes, subtract some catching)
mkdir -p ../../backups/daily/
find ../../backups/hourly/ -type f -mmin +1400 -exec mv {} ../../backups/daily/ \;

# Clear out anything older than 7 days (60 x 24 x 7 = 10,080 minutes, with some padding)
find ../../backups/daily/ -type f -mmin +10110 -delete
