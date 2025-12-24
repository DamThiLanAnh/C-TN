# Quick test DELETE API
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJob2FudCIsImlhdCI6MTc2NjUxNTQyOSwiZXhwIjoxNzY2NTE3MjI5fQ.ugFcCVfc7NEjOtoAJh1Ee3gdLgh5xdIt-YNmgvDjohM"
$leaveId = 6
$url = "https://hrm-backend-1939.onrender.com/api/leave/hr/$leaveId"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "Testing DELETE API: /api/leave/hr/$leaveId" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# Decode token to check user
try {
    $tokenParts = $token.Split('.')
    $payload = $tokenParts[1]
    $padding = 4 - ($payload.Length % 4)
    if ($padding -ne 4) { $payload += "=" * $padding }
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    $tokenData = $decodedText | ConvertFrom-Json

    Write-Host "`n🔍 Token Info:" -ForegroundColor Blue
    Write-Host "  User: $($tokenData.sub)" -ForegroundColor White
    $expDate = [DateTimeOffset]::FromUnixTimeSeconds($tokenData.exp).LocalDateTime
    Write-Host "  Expires: $expDate" -ForegroundColor White

    if ($expDate -gt (Get-Date)) {
        Write-Host "  ✅ Token is VALID" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Token EXPIRED!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "⚠️  Could not decode token" -ForegroundColor Yellow
}

# Make DELETE request
Write-Host "`n🗑️  Sending DELETE request..." -ForegroundColor Blue
Write-Host "  URL: $url" -ForegroundColor Gray

$headers = @{
    "accept" = "*/*"
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri $url -Method Delete -Headers $headers -ErrorAction Stop

    Write-Host "`n✅ ✅ ✅ DELETE SUCCESS! ✅ ✅ ✅" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusDescription)" -ForegroundColor Green

    if ($response.Content) {
        Write-Host "`n  Response Body:" -ForegroundColor White
        Write-Host "  $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "`n  (No response body - Delete successful)" -ForegroundColor Gray
    }

    Write-Host "`n✨ Leave request ID $leaveId has been DELETED by HR" -ForegroundColor Green

} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__

    Write-Host "`n❌ DELETE FAILED" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red

    if ($statusCode -eq 403) {
        Write-Host "`n  🚫 FORBIDDEN" -ForegroundColor Yellow
        Write-Host "  → User does not have HR permission" -ForegroundColor Yellow
    } elseif ($statusCode -eq 401) {
        Write-Host "`n  🔒 UNAUTHORIZED" -ForegroundColor Yellow
        Write-Host "  → Token is invalid or expired" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "`n  ❓ NOT FOUND" -ForegroundColor Yellow
        Write-Host "  → Leave request ID $leaveId does not exist" -ForegroundColor Yellow
    } elseif ($statusCode -eq 204) {
        Write-Host "`n✅ DELETE SUCCESS (No Content)" -ForegroundColor Green
    }

    # Try to read response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        if ($responseBody) {
            Write-Host "`n  Response:" -ForegroundColor Gray
            Write-Host "  $responseBody" -ForegroundColor Gray
        }
    } catch {}
}

Write-Host "`n=====================================================================" -ForegroundColor Cyan

