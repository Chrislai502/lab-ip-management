$ip = Test-Connection -ComputerName (hostname) -Count 1 | Select -ExpandProperty IPV4Address
$username = [Environment]::UserName
$uniqueName = "unique-computer-identifier" # Replace with your computer's unique identifier
$token = "roarmeow" # Your secret token for authentication

# Set the headers to include Authorization and Content-Type
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create the body as a hashtable including uniqueName
$body = @{
    uniqueName = $uniqueName
    username = $username
    ip = $ip
} | ConvertTo-Json

# Use Invoke-RestMethod to send the POST request
Invoke-RestMethod -Uri "https://worker-ip-update.wxunlai.workers.dev/update" -Method Post -Headers $headers -Body $body
