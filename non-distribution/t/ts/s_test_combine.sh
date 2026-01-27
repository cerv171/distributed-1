#!/bin/bash
cd "$(dirname "$0")" || exit 1
# This is a student test
DIFF=${DIFF:-diff}

input="leo
the
big
yellow
dog"

result=$(echo "$input" | ../../c/combine.sh)

expected="leo
the
big
yellow
dog
leo	the	big
the	big	yellow
big	yellow	dog
leo	the
the	big
big	yellow
yellow	dog"

if $DIFF <(echo "$input" | ../../c/combine.sh | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq) <(echo "$expected" | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq) >&2; then
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