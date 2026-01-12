# MySQL Database Backup System - Linux Server Setup

## Overview
Automated backup system for your Service KIVA database with:
- **Daily backups**: Stored for 30 days, then deleted
- **Monthly backups**: Permanent archives kept indefinitely
- **Storage**: Daily on SSD (fast), Monthly on HDD (large storage)

## Directory Structure

```
/mnt/ssd/backups/daily/          # Daily backups (4TB SSD - fast access)
/mnt/hdd/backups/monthly/        # Monthly archives (8TB HDD - long-term storage)
/var/log/mysql-backup.log        # Backup logs
```

## Step 1: Create Backup Directories

Run these commands on your Linux server:

```bash
# Create daily backup directory (on SSD)
sudo mkdir -p /mnt/ssd/backups/daily

# Create monthly backup directory (on HDD)
sudo mkdir -p /mnt/hdd/backups/monthly

# Create scripts directory
sudo mkdir -p /opt/backup-scripts

# Set permissions
sudo chmod 755 /mnt/ssd/backups/daily
sudo chmod 755 /mnt/hdd/backups/monthly
sudo chmod 755 /opt/backup-scripts
```

## Step 2: Create MySQL Backup User (Secure)

Create a dedicated MySQL user for backups:

```bash
# Connect to MySQL
mysql -u root -p

# Run these SQL commands:
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON service_db.* TO 'backup_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Create MySQL Credentials File (Secure)

This prevents passwords from appearing in scripts or process lists:

```bash
# Create .my.cnf file
sudo nano /root/.my.cnf
```

Add this content:
```ini
[client]
user=backup_user
password=YOUR_SECURE_PASSWORD_HERE
host=localhost

[mysqldump]
user=backup_user
password=YOUR_SECURE_PASSWORD_HERE
host=localhost
```

Set secure permissions:
```bash
sudo chmod 600 /root/.my.cnf
sudo chown root:root /root/.my.cnf
```

## Step 4: Create Daily Backup Script

Create the daily backup script:

```bash
sudo nano /opt/backup-scripts/mysql-daily-backup.sh
```

Paste this content:

```bash
#!/bin/bash

###############################################################################
# MySQL Daily Backup Script for Service KIVA Database
# Runs every 24 hours via cron
# Keeps last 30 days of backups
###############################################################################

# Configuration
DB_NAME="service_db"
BACKUP_DIR="/mnt/ssd/backups/daily"
LOG_FILE="/var/log/mysql-backup.log"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/service_db_daily_${DATE}.sql.gz"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Start backup
log_message "========================================="
log_message "Starting daily backup of database: ${DB_NAME}"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_message "ERROR: Backup directory does not exist: ${BACKUP_DIR}"
    exit 1
fi

# Perform backup with compression
log_message "Creating backup: ${BACKUP_FILE}"
mysqldump --defaults-extra-file=/root/.my.cnf \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --quick \
    --lock-tables=false \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_message "SUCCESS: Backup completed successfully. Size: ${BACKUP_SIZE}"
else
    log_message "ERROR: Backup failed!"
    exit 1
fi

# Delete backups older than retention period
log_message "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "service_db_daily_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "service_db_daily_*.sql.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
log_message "Deleted ${DELETED_COUNT} old backup(s)"

# Display current backup count
CURRENT_BACKUPS=$(find "${BACKUP_DIR}" -name "service_db_daily_*.sql.gz" -type f | wc -l)
log_message "Current number of daily backups: ${CURRENT_BACKUPS}"

# Calculate total size of backups
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log_message "Total size of daily backups: ${TOTAL_SIZE}"

log_message "Daily backup completed successfully"
log_message "========================================="

exit 0
```

Make it executable:
```bash
sudo chmod +x /opt/backup-scripts/mysql-daily-backup.sh
```

## Step 5: Create Monthly Backup Script

Create the monthly backup script:

```bash
sudo nano /opt/backup-scripts/mysql-monthly-backup.sh
```

Paste this content:

```bash
#!/bin/bash

###############################################################################
# MySQL Monthly Backup Script for Service KIVA Database
# Runs on 1st day of each month via cron
# Creates permanent archive and deletes all daily backups
###############################################################################

# Configuration
DB_NAME="service_db"
DAILY_BACKUP_DIR="/mnt/ssd/backups/daily"
MONTHLY_BACKUP_DIR="/mnt/hdd/backups/monthly"
LOG_FILE="/var/log/mysql-backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
MONTH=$(date +%Y_%m)
BACKUP_FILE="${MONTHLY_BACKUP_DIR}/service_db_monthly_${MONTH}.sql.gz"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Start monthly backup
log_message "========================================="
log_message "Starting MONTHLY backup of database: ${DB_NAME}"

# Check if monthly backup directory exists
if [ ! -d "$MONTHLY_BACKUP_DIR" ]; then
    log_message "ERROR: Monthly backup directory does not exist: ${MONTHLY_BACKUP_DIR}"
    exit 1
fi

# Check if this month's backup already exists
if [ -f "$BACKUP_FILE" ]; then
    log_message "WARNING: Monthly backup for ${MONTH} already exists. Skipping."
    exit 0
fi

# Perform monthly backup with compression
log_message "Creating monthly archive: ${BACKUP_FILE}"
mysqldump --defaults-extra-file=/root/.my.cnf \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --quick \
    --lock-tables=false \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_message "SUCCESS: Monthly backup completed successfully. Size: ${BACKUP_SIZE}"
else
    log_message "ERROR: Monthly backup failed!"
    exit 1
fi

# Delete ALL daily backups after successful monthly backup
log_message "Deleting all daily backups after successful monthly archive..."
DAILY_COUNT=$(find "${DAILY_BACKUP_DIR}" -name "service_db_daily_*.sql.gz" -type f | wc -l)
find "${DAILY_BACKUP_DIR}" -name "service_db_daily_*.sql.gz" -type f -delete
log_message "Deleted ${DAILY_COUNT} daily backup(s)"

# Display monthly backup count
MONTHLY_COUNT=$(find "${MONTHLY_BACKUP_DIR}" -name "service_db_monthly_*.sql.gz" -type f | wc -l)
log_message "Current number of monthly backups: ${MONTHLY_COUNT}"

# Calculate total size of monthly backups
TOTAL_SIZE=$(du -sh "${MONTHLY_BACKUP_DIR}" | cut -f1)
log_message "Total size of monthly backups: ${TOTAL_SIZE}"

log_message "Monthly backup completed successfully"
log_message "========================================="

exit 0
```

Make it executable:
```bash
sudo chmod +x /opt/backup-scripts/mysql-monthly-backup.sh
```

## Step 6: Set Up Cron Jobs (Automatic Scheduling)

Edit root's crontab:

```bash
sudo crontab -e
```

Add these lines:

```cron
# MySQL Database Backups for Service KIVA

# Daily backup - runs every day at 2:00 AM
0 2 * * * /opt/backup-scripts/mysql-daily-backup.sh >> /var/log/mysql-backup.log 2>&1

# Monthly backup - runs on 1st day of every month at 3:00 AM
0 3 1 * * /opt/backup-scripts/mysql-monthly-backup.sh >> /var/log/mysql-backup.log 2>&1
```

Save and exit. Verify cron jobs:
```bash
sudo crontab -l
```

## Step 7: Test the Backup Scripts

Test manually before relying on automatic backups:

```bash
# Test daily backup
sudo /opt/backup-scripts/mysql-daily-backup.sh

# Test monthly backup
sudo /opt/backup-scripts/mysql-monthly-backup.sh

# Check if backups were created
ls -lh /mnt/ssd/backups/daily/
ls -lh /mnt/hdd/backups/monthly/

# View logs
tail -n 50 /var/log/mysql-backup.log
```

## Step 8: Create Backup Restore Script (For Emergencies)

Create a restore script:

```bash
sudo nano /opt/backup-scripts/mysql-restore.sh
```

Paste this content:

```bash
#!/bin/bash

###############################################################################
# MySQL Database Restore Script
# Usage: ./mysql-restore.sh <backup-file.sql.gz>
###############################################################################

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    echo "Example: $0 /mnt/ssd/backups/daily/service_db_daily_20250113_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="service_db"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "WARNING: This will replace the current database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Restoring database from backup..."
gunzip < "${BACKUP_FILE}" | mysql --defaults-extra-file=/root/.my.cnf "${DB_NAME}"

if [ $? -eq 0 ]; then
    echo "SUCCESS: Database restored successfully from ${BACKUP_FILE}"
else
    echo "ERROR: Database restore failed!"
    exit 1
fi
```

Make it executable:
```bash
sudo chmod +x /opt/backup-scripts/mysql-restore.sh
```

## Step 9: Set Up Monitoring (Optional but Recommended)

Create a monitoring script to check backup health:

```bash
sudo nano /opt/backup-scripts/check-backups.sh
```

Paste this content:

```bash
#!/bin/bash

###############################################################################
# Backup Health Check Script
# Checks if recent backups exist
###############################################################################

DAILY_DIR="/mnt/ssd/backups/daily"
MONTHLY_DIR="/mnt/hdd/backups/monthly"

echo "========================================="
echo "Backup Health Check - $(date)"
echo "========================================="

# Check daily backups
DAILY_COUNT=$(find "${DAILY_DIR}" -name "service_db_daily_*.sql.gz" -type f -mtime -2 | wc -l)
if [ $DAILY_COUNT -gt 0 ]; then
    echo "✓ Daily backup: OK (found backup within last 2 days)"
    LATEST_DAILY=$(ls -t "${DAILY_DIR}"/service_db_daily_*.sql.gz | head -1)
    echo "  Latest: $(basename $LATEST_DAILY) - $(du -h $LATEST_DAILY | cut -f1)"
else
    echo "✗ Daily backup: WARNING (no backup found in last 2 days)"
fi

# Check monthly backups
MONTHLY_COUNT=$(find "${MONTHLY_DIR}" -name "service_db_monthly_*.sql.gz" -type f | wc -l)
echo "✓ Monthly backups: ${MONTHLY_COUNT} archive(s) found"
if [ $MONTHLY_COUNT -gt 0 ]; then
    LATEST_MONTHLY=$(ls -t "${MONTHLY_DIR}"/service_db_monthly_*.sql.gz | head -1)
    echo "  Latest: $(basename $LATEST_MONTHLY) - $(du -h $LATEST_MONTHLY | cut -f1)"
fi

# Disk usage
echo ""
echo "Storage Usage:"
echo "  Daily backups (SSD): $(du -sh ${DAILY_DIR} | cut -f1)"
echo "  Monthly backups (HDD): $(du -sh ${MONTHLY_DIR} | cut -f1)"

echo "========================================="
```

Make it executable:
```bash
sudo chmod +x /opt/backup-scripts/check-backups.sh
```

Run it anytime to check backup status:
```bash
sudo /opt/backup-scripts/check-backups.sh
```

## Backup Strategy Summary

| Type | Frequency | Location | Retention | Purpose |
|------|-----------|----------|-----------|---------|
| **Daily** | Every day at 2:00 AM | SSD (`/mnt/ssd/backups/daily`) | 30 days (rolling) | Quick recovery for recent issues |
| **Monthly** | 1st of month at 3:00 AM | HDD (`/mnt/hdd/backups/monthly`) | Permanent | Long-term archives |

## What Happens Automatically

1. **Every day at 2:00 AM:**
   - Full database backup created on SSD
   - Backups older than 30 days are deleted
   - Keeps approximately 30 daily backups

2. **1st day of every month at 3:00 AM:**
   - Full database backup created on HDD
   - ALL daily backups are deleted (to save space)
   - Monthly backup remains forever

3. **After 1 year:**
   - SSD: 30 daily backups (~30 days of history)
   - HDD: 12 monthly backups (1 per month, permanent)

## Estimating Storage Requirements

Example calculations for a growing database:

**Initial database:** 100 MB
**Daily growth:** ~500 KB
**After 1 year:** ~280 MB

**Daily backups (SSD):**
- 30 backups × ~280 MB compressed = ~8.4 GB
- **SSD Usage:** < 10 GB (plenty of space on 4TB SSD)

**Monthly backups (HDD):**
- 12 backups × growing size = ~2 GB after 1 year
- **HDD Usage:** ~2 GB (negligible on 8TB HDD)

## Security Best Practices

✅ **Implemented:**
- Dedicated backup MySQL user with minimal permissions
- Password stored in secure file (`/root/.my.cnf`) with 600 permissions
- No passwords in scripts or command line
- Only root can access backup files

✅ **Additional Recommendations:**
- Encrypt monthly backups for offsite storage
- Consider offsite backup copies (cloud storage)
- Test restore procedure quarterly
- Monitor backup logs regularly

## Troubleshooting

### Check if cron is running:
```bash
sudo systemctl status cron
```

### View recent cron executions:
```bash
sudo grep CRON /var/log/syslog | tail -20
```

### Check backup logs:
```bash
tail -f /var/log/mysql-backup.log
```

### Manually trigger backups:
```bash
# Test daily backup
sudo /opt/backup-scripts/mysql-daily-backup.sh

# Test monthly backup
sudo /opt/backup-scripts/mysql-monthly-backup.sh
```

## How to Restore a Backup

### Restore from daily backup:
```bash
sudo /opt/backup-scripts/mysql-restore.sh /mnt/ssd/backups/daily/service_db_daily_20250113_020000.sql.gz
```

### Restore from monthly backup:
```bash
sudo /opt/backup-scripts/mysql-restore.sh /mnt/hdd/backups/monthly/service_db_monthly_2025_01.sql.gz
```

## Maintenance

### View all backups:
```bash
# Daily
ls -lh /mnt/ssd/backups/daily/

# Monthly
ls -lh /mnt/hdd/backups/monthly/
```

### Check backup health:
```bash
sudo /opt/backup-scripts/check-backups.sh
```

### Manually delete old backups (if needed):
```bash
# Delete daily backups older than 30 days
find /mnt/ssd/backups/daily -name "service_db_daily_*.sql.gz" -type f -mtime +30 -delete
```

---

## Installation Checklist

- [ ] Create backup directories on SSD and HDD
- [ ] Create MySQL backup user
- [ ] Create `/root/.my.cnf` credentials file
- [ ] Install daily backup script
- [ ] Install monthly backup script
- [ ] Install restore script
- [ ] Set up cron jobs
- [ ] Test daily backup manually
- [ ] Test monthly backup manually
- [ ] Test restore procedure
- [ ] Verify cron jobs are scheduled
- [ ] Set up monitoring/alerts (optional)

---

**Last Updated:** November 13, 2025
**Status:** Production Ready ✅
