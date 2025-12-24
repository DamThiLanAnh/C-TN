# PowerShell Script to Test Delete Leave API
# Usage: .\test-delete-api.ps1

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "🧪 TEST DELETE LEAVE API - HR PERMISSION" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "https://hrm-backend-1939.onrender.com"
$ENDPOINT = "/api/leave/hr"

# Prompt for inputs
Write-Host "📝 Enter test details:" -ForegroundColor Yellow
Write-Host ""

$leaveId = Read-Host "Leave ID to delete (e.g., 17)"
$token = Read-Host "Authorization Token (JWT)"

if ([string]::IsNullOrWhiteSpace($leaveId) -or [string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Error: Leave ID and Token are required!" -ForegroundColor Red
    exit 1
}

# Decode token to check user info
try {
    $tokenParts = $token.Split('.')
    if ($tokenParts.Length -ge 2) {
        $payload = $tokenParts[1]
        # Add padding if needed
        $padding = 4 - ($payload.Length % 4)
        if ($padding -ne 4) {
            $payload += "=" * $padding
        }

        $decodedBytes = [System.Convert]::FromBase64String($payload)
        $decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
        $tokenData = $decodedText | ConvertFrom-Json

        Write-Host ""
        Write-Host "🔍 Token Information:" -ForegroundColor Blue
        Write-Host "  User: $($tokenData.sub)" -ForegroundColor White

        if ($tokenData.auth) {
            Write-Host "  Role: $($tokenData.auth)" -ForegroundColor White

            $isHR = $tokenData.auth -eq "ROLE_HR" -or $tokenData.auth -eq "HR"
            if ($isHR) {
                Write-Host "  ✅ User is HR - Delete should work" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  User is NOT HR - Delete will be forbidden" -ForegroundColor Yellow
            }
        }

        if ($tokenData.exp) {
            $expDate = [DateTimeOffset]::FromUnixTimeSeconds($tokenData.exp).LocalDateTime
            Write-Host "  Expires: $expDate" -ForegroundColor White

            if ($expDate -lt (Get-Date)) {
                Write-Host "  ❌ Token EXPIRED!" -ForegroundColor Red
            } else {
                Write-Host "  ✅ Token is valid" -ForegroundColor Green
            }
        }
    }
} catch {
    Write-Host "⚠️  Could not decode token" -ForegroundColor Yellow
}

# Confirm before proceeding
Write-Host ""
$confirm = Read-Host "Continue with DELETE request? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
    exit 0
}

# Make DELETE request
Write-Host ""
Write-Host "🗑️  Sending DELETE request..." -ForegroundColor Blue
Write-Host "   URL: DELETE $BASE_URL$ENDPOINT/$leaveId" -ForegroundColor Gray

$url = "$BASE_URL$ENDPOINT/$leaveId"
$headers = @{
    "accept" = "*/*"
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri $url -Method Delete -Headers $headers -ErrorAction Stop

    Write-Host ""
    Write-Host "✅ SUCCESS - Delete completed!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green

    if ($response.Content) {
        Write-Host "   Response: $($response.Content)" -ForegroundColor White
    }

} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDescription = $_.Exception.Response.StatusDescription

    Write-Host ""
    Write-Host "❌ DELETE FAILED" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode - $statusDescription" -ForegroundColor Red

    if ($statusCode -eq 403) {
        Write-Host "   🚫 FORBIDDEN - User does not have permission to delete" -ForegroundColor Yellow
        Write-Host "   → Only HR role can delete leave requests" -ForegroundColor Yellow
    } elseif ($statusCode -eq 401) {
        Write-Host "   🔒 UNAUTHORIZED - Token is invalid or expired" -ForegroundColor Yellow
        Write-Host "   → Please login again to get a new token" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "   ❓ NOT FOUND - Leave request with ID $leaveId does not exist" -ForegroundColor Yellow
    }

    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()

        if ($responseBody) {
            Write-Host "   Response: $responseBody" -ForegroundColor Gray
        }
    } catch {
        # Ignore error reading response body
    }
}

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Test completed" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

