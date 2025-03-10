#!/bin/bash

# This script fixes the AWS credentials in .env.local

echo "Fixing AWS credentials in .env.local..."

# Create a temporary file with correct formatting
tmp_file=$(mktemp)

# Read the current .env.local file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip AWS lines, we'll add them back later
  if [[ ! $line =~ ^AWS_ ]] && [[ ! $line =~ ^# ]]; then
    echo "$line" >> "$tmp_file"
  fi
done < .env.local

# Add AWS variables with proper formatting
cat << EOF >> "$tmp_file"

# AWS S3 Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET=print-drops-purgatory
EOF

# Replace .env.local with the temporary file
mv "$tmp_file" .env.local

echo "Done! .env.local has been updated with placeholder AWS credentials."
echo "Please edit the file to replace YOUR_AWS_ACCESS_KEY and YOUR_AWS_SECRET_KEY with your actual AWS credentials."
echo "Then restart your Next.js server for the changes to take effect."
