# Test creating and deleting a subject via API
$baseUrl = "http://localhost:3000"

Write-Host "1. Creating test subject..." -ForegroundColor Cyan
$createBody = @{
    code = "CS999"
    name = "Temporary Quantum Computing Test"
    credits = 4
    semester = 5
    description = "Test course for deletion verification"
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "$baseUrl/api/subjects" -Method POST -ContentType "application/json" -Body $createBody
Write-Host "Created Subject ID: $($res.id), Code: $($res.code)" -ForegroundColor Green
$subjectId = $res.id

Write-Host "2. Deleting subject via DELETE /api/subjects?id=$subjectId..." -ForegroundColor Cyan
$delRes = Invoke-RestMethod -Uri "$baseUrl/api/subjects?id=$subjectId" -Method DELETE
Write-Host "Delete response: $($delRes | ConvertTo-Json -Compress)" -ForegroundColor Green

Write-Host "3. Verifying subject no longer exists..." -ForegroundColor Cyan
try {
    $delAgain = Invoke-RestMethod -Uri "$baseUrl/api/subjects?id=$subjectId" -Method DELETE
    Write-Host "Unexpected success on second delete: $($delAgain | ConvertTo-Json)" -ForegroundColor Red
} catch {
    Write-Host "Successfully received error on non-existent subject: $($_.Exception.Message)" -ForegroundColor Green
}
