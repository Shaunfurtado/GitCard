# Define URL and output files
$url = "https://streak-stats.demolab.com/?user=GITHUB_USERNAME"
$responseFile = "response.txt"
$extractedDataFile = "extracted_data.txt"
$finalOutputFile = "final_output.txt"

# Fetch the data from the URL
Write-Host "Fetching data..."
Invoke-WebRequest -Uri $url -OutFile $responseFile

# Extract data between <text> and </text> tags
Write-Host "Extracting data..."
$content = Get-Content $responseFile -Raw
$matches = [regex]::Matches($content, '<text[^>]*>(.*?)<\/text>', 'Singleline')
$extractedData = $matches | ForEach-Object { $_.Groups[1].Value.Trim() }

# Save the extracted data to a file
$extractedData -join "`r`n" | Set-Content $extractedDataFile

# Extract specific lines (1st, 3rd, 7th, and 9th)
$extractedLines = Get-Content $extractedDataFile
$linesToExtract = @(1, 3, 7, 9) # Lines to extract

$formattedLines = @()
for ($i = 0; $i -lt $extractedLines.Count; $i++) {
    if ($linesToExtract -contains ($i + 1)) {
        $formattedLines += '"' + $extractedLines[$i].Trim() + '"'
    }
}

# Join the formatted lines into a desired array format
$formattedArray = "[" + ($formattedLines -join ",") + "]"

# Save the final output to the output file
$formattedArray | Set-Content $finalOutputFile

# Final output file check
Write-Host "Final output file content:"
Get-Content $finalOutputFile
