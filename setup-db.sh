#!/bin/bash
# COOP-ITSM Database Setup Script
# Run this to create the database user and database on PostgreSQL,
# or simply use Docker: docker compose up -d postgres

set -e

DB_USER="coop_user"
DB_PASS="coop_pass"
DB_NAME="coop_itsm_db"
DB_PORT="5435"

echo "Setting up COOP-ITSM database..."

# Check if docker is available first
if command -v docker &>/dev/null && [ -f "docker-compose.yml" ]; then
  echo "Starting PostgreSQL container on port $DB_PORT via Docker Compose..."
  docker compose up -d postgres
  echo "Waiting for PostgreSQL container to become healthy..."
  docker compose ps
elif command -v sudo &>/dev/null; then
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
  echo "Please manually create or verify:"
  echo "  User: $DB_USER with password $DB_PASS"
  echo "  Database: $DB_NAME owned by $DB_USER"
fi

echo "Database setup complete!"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:$DB_PORT/$DB_NAME?schema=public"
