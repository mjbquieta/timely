#!/bin/sh

# Generate runtime environment configuration
cat > /app/dist/env-config.js << EOF
// Runtime environment configuration
window.env = {
  VITE_API_BASE_URL: '${VITE_API_BASE_URL:-http://localhost:3001}'
};
EOF

# Start the application
exec "$@"
