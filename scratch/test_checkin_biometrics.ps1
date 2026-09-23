$BaseUrl = "http://localhost:3000"

# 1. Login as Faculty FAC101 to start a live session
$loginBody = @{
    identifier = "FAC101"
    role = "faculty"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable facultySession
Write-Host "Faculty logged in: $($loginRes.user.name)" -ForegroundColor Green

# 2. Get offering
$dashRes = Invoke-RestMethod -Uri "$BaseUrl/api/faculty/face-id" -Method Get -WebSession $facultySession
$student = $dashRes.students | Where-Object { $_.faceId -eq "9876543" }

Write-Host "Student test record: $($student.user.name), Face ID: $($student.faceId)" -ForegroundColor Cyan

# 3. Test checkin with WRONG Face ID
$wrongBody = @{
    studentId = $student.id
    faceId = "1111111"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BaseUrl/api/student/checkin" -Method Post -Body $wrongBody -ContentType "application/json"
    Write-Host "ERROR: Wrong Face ID was accepted!" -ForegroundColor Red
} catch {
    Write-Host "Expected rejection for wrong Face ID: $($_.Exception.Message)" -ForegroundColor Green
}

# 4. Clear the test descriptor for Aarav Reddy back to fresh state
$clearBody = @{
    action = "CLEAR"
    studentId = $student.id
} | ConvertTo-Json
$clearRes = Invoke-RestMethod -Uri "$BaseUrl/api/faculty/face-id" -Method Post -Body $clearBody -ContentType "application/json" -WebSession $facultySession
Write-Host "Cleared test descriptor: $($clearRes.success)" -ForegroundColor Green
