# =============================================================================
# MONTHLY BACKUP
# =============================================================================
export PATH="$PATH:/usr/local/bin"  # Needed for ubuntu rethinkdb-dump.
                                    # See: http://stackoverflow.com/a/32786725/476426

# Get the 4-week old backup from weekly folder (60 x 24 x 7 x 4 = 40,320 minutes, subtract some catching)
mkdir -p ../../backups/monthly/
find ../../backups/weekly/ -type f -mmin +40000 -exec mv {} ../../backups/monthly/ \;

# Clear out anything older than 12 months (60 x 24 x 7 x 4 x 13 = 524,160 minutes, with some padding)
find ../../backups/monthly/ -type f -mmin +525000 -delete
