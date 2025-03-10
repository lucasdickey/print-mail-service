#!/bin/bash

# This script helps set up AWS environment variables in .env.local

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo ".env.local file not found. Creating a new one."
  touch .env.local
fi

# Add AWS environment variables to .env.local
echo "Adding AWS environment variables to .env.local..."

# Append AWS variables to .env.local
cat << EOF >> .env.local

# AWS S3 Configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=print-drops-purgatory
EOF

echo "Done! Please edit .env.local to replace the placeholder values with your actual AWS credentials."
echo "Then restart your Next.js server for the changes to take effect."
