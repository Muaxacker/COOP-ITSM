#!/bin/bash
# BankCare Database Setup Script
# Run this once to create the database user and database.
# Requires sudo or postgres access.

set -e

DB_USER="bankcare_user"
DB_PASS="bankcare_pass"
DB_NAME="bankcare_db"

echo "Setting up BankCare database..."

# Try to create user and database as postgres superuser
if command -v sudo &>/dev/null; then
  sudo -u postgres psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
  END IF;
END
\$\$;
EOF
  sudo -u postgres createdb -O $DB_USER $DB_NAME 2>/dev/null || echo "Database may already exist"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
else
  echo "sudo not available. Please manually create:"
  echo "  User: $DB_USER with password $DB_PASS"
  echo "  Database: $DB_NAME owned by $DB_USER"
fi

echo "Database setup complete!"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
