#!/bin/bash
cd "$(dirname "$0")" || exit 1

QUERY_TERMS=("the" "man" "computer science" "world" "big bed" "aberdeen ship")
NUM_QUERIES=${#QUERY_TERMS[@]}

start_time=$(date +%s.%N)

for query in "${QUERY_TERMS[@]}"; do
  ./query.js "$query" d/global-index.txt > /dev/null
done

end_time=$(date +%s.%N)
total_time=$(echo "$end_time - $start_time" | bc)
query_throughput=$(echo "scale=4; $NUM_QUERIES / $total_time " | bc)

echo "Total time: ${total_time}s" >/dev/stderr
echo "Throughput: ${query_throughput} queries/sec" >/dev/stderr