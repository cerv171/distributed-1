#!/bin/bash
cd "$(dirname "$0")" || exit 1

base_url="https://cs.brown.edu/courses/csci1380/sandbox/1/"

result=$(../../c/getURLs.js "$base_url" < page.html)
expected="https://cs.brown.edu/courses/csci1380/sandbox/1//level_1a/index.html
https://cs.brown.edu/courses/csci1380/sandbox/1//level_1b/index.html
https://cs.brown.edu/courses/csci1380/sandbox/1//level_1c/index.html"

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