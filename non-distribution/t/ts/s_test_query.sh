#!/bin/bash
# This is a student test
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../../$R_FOLDER" || exit 1
input="cat"
global_content="cat | p2 5
dog | p2 1
cat dog | p2 1
cats ca cats | p2 5
cat cat | p2 5"
echo "$global_content" > d/global-index.txt
result=$(./query.js cat)
expected="cat | p2 5
cat dog | p2 1
cat cat | p2 5"
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