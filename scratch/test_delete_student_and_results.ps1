# Test creating and deleting student and semester result via API
$baseUrl = "http://localhost:3000"

Write-Host "1. Testing student creation..." -ForegroundColor Cyan
$createStudentBody = @{
    name = "Test Deletable Student"
    email = "deletable.student@edusync.edu"
    rollNo = "99DEL99"
    registerNo = "REG9999999"
    section = "A"
    currentSemester = 5
    guardianName = "Test Guardian"
    guardianPhone = "+91 99999 88888"
} | ConvertTo-Json

$student = Invoke-RestMethod -Uri "$baseUrl/api/students" -Method POST -ContentType "application/json" -Body $createStudentBody
$studentId = $student.id
Write-Host "Created Student ID: $studentId, Name: $($student.user.name), Roll: $($student.rollNo)" -ForegroundColor Green

# 2. Add a semester result for this student directly via Prisma check
Write-Host "2. Fetching semester results list..." -ForegroundColor Cyan
$results = Invoke-RestMethod -Uri "$baseUrl/api/results"
Write-Host "Total existing semester results: $($results.Count)" -ForegroundColor Green

# 3. If there is a semester result or we delete one, let's create a temporary result in DB using node script
$nodeScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.semesterResult.create({
    data: {
      studentId: '$studentId',
      semester: 4,
      academicYear: '2024-2025',
      sgpa: 8.75,
      cgpa: 8.50,
      totalCredits: 20,
      earnedCredits: 20,
      status: 'PASSED',
      subjectResults: {
        create: [
          { subjectCode: 'CS401', subjectName: 'Theory of Computation', credits: 4, internalMarks: 44, externalMarks: 45, totalMarks: 89, grade: 'A+' }
        ]
      }
    }
  });
  console.log(r.id);
  await prisma.`$disconnect();
}
main();
"@
$resultId = ($nodeScript | node).Trim()
Write-Host "Created test semester result ID: $resultId" -ForegroundColor Green

# 4. Test DELETE /api/results?id=$resultId
Write-Host "4. Deleting semester result via DELETE /api/results?id=$resultId..." -ForegroundColor Cyan
$delResultRes = Invoke-RestMethod -Uri "$baseUrl/api/results?id=$resultId" -Method DELETE
Write-Host "Delete Result Response: $($delResultRes | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verify result is gone
try {
    $checkRes = Invoke-RestMethod -Uri "$baseUrl/api/results?id=$resultId" -Method DELETE
    Write-Host "Unexpected success deleting result again: $($checkRes | ConvertTo-Json)" -ForegroundColor Red
} catch {
    Write-Host "Confirmed semester result no longer exists (404 expected): $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Test DELETE /api/students?id=$studentId
Write-Host "5. Deleting student via DELETE /api/students?id=$studentId..." -ForegroundColor Cyan
$delStudentRes = Invoke-RestMethod -Uri "$baseUrl/api/students?id=$studentId" -Method DELETE
Write-Host "Delete Student Response: $($delStudentRes | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verify student is gone
try {
    $checkStudent = Invoke-RestMethod -Uri "$baseUrl/api/students?id=$studentId" -Method DELETE
    Write-Host "Unexpected success deleting student again: $($checkStudent | ConvertTo-Json)" -ForegroundColor Red
} catch {
    Write-Host "Confirmed student no longer exists (404 expected): $($_.Exception.Message)" -ForegroundColor Green
}
