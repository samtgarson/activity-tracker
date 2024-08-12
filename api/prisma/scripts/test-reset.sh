#!/bin/bash

# Get the root directory
root=$(dirname "$(dirname "$(readlink -f "$0")")")
echo "Root: $root"

# Remove the existing test database
rm -f "$root/test.db"

# Loop through migration files and apply them
for file in "$root"/migrations/*; do
  if [ -f "$file" ]; then
    echo "Applying $(basename "$file")"
    sqlite3 "$root/test.db" < "$file"
  fi
done
