#!/bin/bash
# This is a student test
cd "$(dirname "$0")" || exit 1

base_url="https://cs.brown.edu/courses/csci1380/sandbox/1/"
input="dog
dog
dog
cat
cat
mouse"
result=$(echo "$input" | ../../c/invert.sh "$base_url")
expected="cat | 2 | https://cs.brown.edu/courses/csci1380/sandbox/1/
dog | 3 | https://cs.brown.edu/courses/csci1380/sandbox/1/
mouse | 1 | https://cs.brown.edu/courses/csci1380/sandbox/1/"

if [ "$result" = "$expected" ]; then
  echo "Test passed"
  exit 0
else
  echo "Test failed"
  echo "Expected:"
  echo "$expected"
  echo "Got:"
  echo "$result"
  exit 1
fi
