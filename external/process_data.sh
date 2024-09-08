#!/bin/bash

# Download the response file
curl https://streak-stats.demolab.com/?user=Shaunfurtado -o response.txt

# Extract and clean the data
sed -n '/<text[^>]*>/,/<\/text>/p' response.txt | sed 's/<\/\?text[^>]*>//g' | sed '/^[[:space:]]*$/d' | sed 's/^[ \t]*//;s/[ \t]*$//' > extracted_data.txt

# Format the data into an array with specific lines
awk 'NR==1{a[1]=$0} NR==3{a[3]=$0} NR==7{a[7]=$0} NR==9{a[9]=$0} END{print "[" "\""a[1]"\""",""\""a[3]"\""",""\""a[7]"\""",""\""a[9]"\"""]"}' extracted_data.txt > final_output.txt