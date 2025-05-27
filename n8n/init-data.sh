#!/bin/bash
set -e

# Create the n8n database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Database is already created by POSTGRES_DB environment variable
    -- Grant necessary permissions
    GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;
    
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "PostgreSQL initialization completed for n8n"