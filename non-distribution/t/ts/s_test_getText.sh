#!/bin/bash
# This is a student test
cd "$(dirname "$0")" || exit 1

result=$(../../c/getText.js < page.html)
expected="WELCOME TO CS1380 SIMPLE LINKS

Check out my Some stuff [level_1a/index.html].

Check out my Some more stuff [level_1b/index.html].

Check out a few Some more more stuff [level_1c/index.html].

© 2023 CS1380. All rights reserved."
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