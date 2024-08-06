#!/usr/bin/env zsh

local root=$(dirname "${0:A:h}")
echo "Root: $root"
rm "$root/test.db"
for file in $(ls "$root/migrations"); do
  echo "Applying $file"
  sqlite3 "$root/test.db" < "$root/migrations/$file"
done
