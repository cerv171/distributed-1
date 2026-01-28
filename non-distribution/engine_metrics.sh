#!/bin/bash
# This is the main entry point of the search engine.
cd "$(dirname "$0")" || exit 1

start_time=$(date +%s.%N)
total_crawl_time=0
total_index_time=0
url_count=0

while read -r url; do

  if [[ "$url" == "stop" ]]; then
    # stop the engine if it sees the string "stop" 
    exit;
  fi
  if grep -qxF "$url" d/visited.txt; then
    continue
  fi
  echo "[engine] crawling $url">/dev/stderr
  crawl_start=$(date +%s.%N)
  ./crawl.sh "$url" >d/content.txt
  crawl_end=$(date +%s.%N)
  crawl_time=$(echo "$crawl_end - $crawl_start" | bc)

  index_start=$(date +%s.%N)
  echo "[engine] indexing $url">/dev/stderr
  ./index.sh d/content.txt "$url"
  index_end=$(date +%s.%N)
  index_time=$(echo "$index_end - $index_start" | bc)
  total_crawl_time=$(echo "$total_crawl_time + $crawl_time" | bc)
  total_index_time=$(echo "$total_index_time + $index_time" | bc)
  url_count=$((url_count + 1))

  if  [[ "$(cat d/visited.txt | wc -l)" -ge "$(cat d/urls.txt | wc -l)" ]]; then
      # stop the engine if it has seen all available URLs
      end_time=$(date +%s.%N)
      total_time=$(echo "$end_time - $start_time" | bc)
      avg_crawl=$(echo "scale=3; $total_crawl_time / $url_count" | bc)
      avg_index=$(echo "scale=3; $total_index_time / $url_count" | bc)
      throughput=$(echo "scale=3; $url_count / $total_time" | bc)
    
      echo "URLs processed: $url_count" >/dev/stderr
      echo "Avg crawl time: ${avg_crawl}s" >/dev/stderr
      echo "Avg index time: ${avg_index}s" >/dev/stderr
      echo "Total time: ${total_time}s" >/dev/stderr
      echo "Throughput: ${throughput} URLs/sec" >/dev/stderr
      break;
  fi

done < <(tail -f d/urls.txt)