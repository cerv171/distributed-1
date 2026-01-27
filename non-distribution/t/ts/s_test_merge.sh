#!/bin/bash
# This is a student test
cd "$(dirname "$0")" || exit 1

input="cat | 2 | p1
dog | 3 | p1
mouse | 1 | p2"
global_content="cat | p2 5
dog | p2 1"
global_index=$(mktemp)
echo "$global_content" > "$global_index"
result=$(echo "$input" | ../../c/merge.js "$global_index")
rm "$global_index"
expected="cat | p2 5 p1 2
dog | p1 3 p2 1
mouse | p2 1"
if [ "$result" = "$expected" ]; then
  echo "Test passed"
  exit 0
else
  echo "Test failed"
  echo "Expected:"
  echo "$expected"
  echo "---"
  echo "Got:"
  echo "$result"
  exit 1
fi