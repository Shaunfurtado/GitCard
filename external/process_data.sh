#!/bin/bash

# Fetch and process the data directly without creating intermediate files
curl -s https://streak-stats.demolab.com/?user=GITHUB_USERNAME | \
sed -n '/<text[^>]*>/,/<\/text>/p' | \
sed 's/<\/\?text[^>]*>//g' | \
sed '/^[[:space:]]*$/d' | \
sed 's/^[ \t]*//;s/[ \t]*$//' | \
awk 'NR==1{a[1]=$0} NR==3{a[3]=$0} NR==7{a[7]=$0} NR==9{a[9]=$0} END{print "[" "\""a[1]"\""",""\""a[3]"\""",""\""a[7]"\""",""\""a[9]"\"""]"}' > final_output.txt
