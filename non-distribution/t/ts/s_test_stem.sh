#!/bin/bash
# This is a student test
cd "$(dirname "$0")" || exit 1

input="eating
freeing
dog
fainted"
result=$(echo "$input" | ../../c/stem.js)
expected="eat
free
dog
faint"
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