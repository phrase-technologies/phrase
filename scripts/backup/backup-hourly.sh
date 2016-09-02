# =============================================================================
# HOURLY BACKUP
# =============================================================================
export PATH="$PATH:/usr/local/bin"  # Needed for ubuntu rethinkdb-dump.
                                    # See: http://stackoverflow.com/a/32786725/476426

# Create the new backup
rethinkdb dump

# Move it to the hourly folder
mkdir -p ../../backups/hourly/
mv rethinkdb_dump_* ../../backups/hourly/

# Clear out anything older than 24 hours (60 x 24 = 1440 minutes, with some padding)
find ../../backups/hourly/ -type f -mmin +1470 -delete
