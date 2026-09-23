# Test creating and deleting syllabus unit & topic via API
$baseUrl = "http://localhost:3000"

Write-Host "1. Testing Syllabus page status..." -ForegroundColor Cyan
$pageCheck = Invoke-WebRequest -Uri "$baseUrl/faculty/syllabus" -UseBasicParsing
Write-Host "Syllabus page status: $($pageCheck.StatusCode)" -ForegroundColor Green

# Find or create a test subject
$subRes = Invoke-RestMethod -Uri "$baseUrl/api/subjects" -Method POST -ContentType "application/json" -Body (@{
    code = "CS888"
    name = "Temp Subject for Syllabus Delete Test"
    credits = 3
    semester = 5
    description = "Temporary subject"
} | ConvertTo-Json)
$testSubId = $subRes.id
Write-Host "Created test subject: $testSubId" -ForegroundColor Green

# 2. Create Unit
Write-Host "2. Creating test unit..." -ForegroundColor Cyan
$createUnitBody = @{
    type = "UNIT"
    subjectId = $testSubId
    unitNumber = 9
    title = "Advanced Quantum Graph Search"
    description = "Test unit to be deleted"
} | ConvertTo-Json

$unitRes = Invoke-RestMethod -Uri "$baseUrl/api/syllabus" -Method POST -ContentType "application/json" -Body $createUnitBody
$testUnitId = $unitRes.unit.id
Write-Host "Created Unit ID: $testUnitId, Title: $($unitRes.unit.title)" -ForegroundColor Green

# 3. Create Topic
Write-Host "3. Creating test topic in unit..." -ForegroundColor Cyan
$createTopicBody = @{
    type = "TOPIC"
    unitId = $testUnitId
    topicNumber = 1
    title = "Grover Search Variations"
    difficulty = "HARD"
    estimatedHours = 5
} | ConvertTo-Json

$topicRes = Invoke-RestMethod -Uri "$baseUrl/api/syllabus" -Method POST -ContentType "application/json" -Body $createTopicBody
$testTopicId = $topicRes.topic.id
Write-Host "Created Topic ID: $testTopicId, Title: $($topicRes.topic.title)" -ForegroundColor Green

# 4. Delete Topic
Write-Host "4. Deleting test topic via DELETE /api/syllabus?type=TOPIC&id=$testTopicId..." -ForegroundColor Cyan
$delTopicRes = Invoke-RestMethod -Uri "$baseUrl/api/syllabus?type=TOPIC&id=$testTopicId" -Method DELETE
Write-Host "Delete Topic Response: $($delTopicRes | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verify topic is gone
try {
    $checkTopic = Invoke-RestMethod -Uri "$baseUrl/api/syllabus?type=TOPIC&id=$testTopicId" -Method DELETE
    Write-Host "Unexpected success deleting topic again: $($checkTopic | ConvertTo-Json)" -ForegroundColor Red
} catch {
    Write-Host "Confirmed topic no longer exists (404 expected): $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Delete Unit
Write-Host "5. Deleting test unit via DELETE /api/syllabus?type=UNIT&id=$testUnitId..." -ForegroundColor Cyan
$delUnitRes = Invoke-RestMethod -Uri "$baseUrl/api/syllabus?type=UNIT&id=$testUnitId" -Method DELETE
Write-Host "Delete Unit Response: $($delUnitRes | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verify unit is gone
try {
    $checkUnit = Invoke-RestMethod -Uri "$baseUrl/api/syllabus?type=UNIT&id=$testUnitId" -Method DELETE
    Write-Host "Unexpected success deleting unit again: $($checkUnit | ConvertTo-Json)" -ForegroundColor Red
} catch {
    Write-Host "Confirmed unit no longer exists (404 expected): $($_.Exception.Message)" -ForegroundColor Green
}

# Clean up test subject
Invoke-RestMethod -Uri "$baseUrl/api/subjects?id=$testSubId" -Method DELETE | Out-Null
Write-Host "Cleaned up test subject." -ForegroundColor Green
