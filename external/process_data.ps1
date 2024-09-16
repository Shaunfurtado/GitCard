# Define URL and final output file
$url = "https://streak-stats.demolab.com/?user=GITHUB_USERNAME"
$finalOutputFile = "final_output.txt"

# Fetch the data from the URL and extract the relevant content
Write-Host "Fetching and extracting data..."
$content = Invoke-WebRequest -Uri $url -UseBasicParsing | Select-Object -ExpandProperty Content

# Extract data between <text> and </text> tags using regex
$matches = [regex]::Matches($content, '<text[^>]*>(.*?)<\/text>', 'Singleline')
$extractedData = $matches | ForEach-Object { $_.Groups[1].Value.Trim() } | Where-Object { $_ -ne "" }

# Extract specific lines (1st, 3rd, 7th, and 9th)
$linesToExtract = @(1, 3, 7, 9)
$formattedLines = @()

for ($i = 0; $i -lt $extractedData.Count; $i++) {
    if ($linesToExtract -contains ($i + 1)) {
        $formattedLines += '"' + $extractedData[$i].Trim() + '"'
    }
}

# Join the formatted lines into the desired array format
$formattedArray = "[" + ($formattedLines -join ",") + "]"

# Save the final output to the output file
$formattedArray | Set-Content $finalOutputFile

# Final output file check
Write-Host "Final output file content:"
Get-Content $finalOutputFile
