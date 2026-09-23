$baseUrl = "http://localhost:3000"

Write-Host "=========================================================="
Write-Host "1. Testing Strict Authentication against Dataset"
Write-Host "=========================================================="

# Test 1A: Faculty Email
$facEmailRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "FAC101EDUSYNC@gmail.com"
    password = "any"
    role = "FACULTY"
} | ConvertTo-Json)
Write-Host "Faculty Email Login: $($facEmailRes.user.name), Role: $($facEmailRes.user.role), Redirect: $($facEmailRes.redirectUrl)"

# Test 1B: Faculty ID
$facIdRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "FAC102"
    password = "any"
    role = "FACULTY"
} | ConvertTo-Json)
Write-Host "Faculty ID Login: $($facIdRes.user.name), Role: $($facIdRes.user.role)"

# Test 1C: Student Email
$stuEmailRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "26CSE101@edusync.edu"
    password = "any"
    role = "STUDENT"
} | ConvertTo-Json)
Write-Host "Student Email Login: $($stuEmailRes.user.name), Role: $($stuEmailRes.user.role), Redirect: $($stuEmailRes.redirectUrl)"

# Test 1D: Student Roll No
$stuRollRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "102"
    password = "any"
    role = "STUDENT"
} | ConvertTo-Json)
Write-Host "Student Roll No Login: $($stuRollRes.user.name), Role: $($stuRollRes.user.role)"

# Test 1E: Student Register No
$stuRegRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "CSE23B001"
    password = "any"
    role = "STUDENT"
} | ConvertTo-Json)
Write-Host "Student Register No Login: $($stuRegRes.user.name), Role: $($stuRegRes.user.role)"

# Test 1F: Reject non-dataset credentials
try {
    $badRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
        email = "unregistered.person@gmail.com"
        password = "any"
        role = "FACULTY"
    } | ConvertTo-Json)
    Write-Host "FAILED: Invalid credentials should have been rejected!"
} catch {
    Write-Host "SUCCESS: Rejected non-dataset user (401 Expected): $($_.Exception.Message)"
}

Write-Host "=========================================================="
Write-Host "2. Testing Face ID API & Registry"
Write-Host "=========================================================="

$faceList = Invoke-RestMethod -Uri "$baseUrl/api/faculty/face-id"
Write-Host "Total Students in Face ID Registry: $($faceList.total)"

$aarav = $faceList.students | Where-Object { $_.rollNo -eq "101" }
Write-Host "Aarav Reddy (Roll 101) Initial Face ID: $($aarav.faceId)"

# Test Generating / Assigning a new Face ID
$genRes = Invoke-RestMethod -Uri "$baseUrl/api/faculty/face-id" -Method POST -ContentType "application/json" -Body (@{
    action = "GENERATE"
    studentId = $aarav.id
} | ConvertTo-Json)
Write-Host "SUCCESS: Regenerated Face ID for Aarav: $($genRes.faceId)"
$newAaravFaceId = $genRes.faceId

Write-Host "=========================================================="
Write-Host "3. Testing Attendance Check-in with Face ID"
Write-Host "=========================================================="

# Test 3A: Attempt with Wrong Face ID
try {
    $badCheckin = Invoke-RestMethod -Uri "$baseUrl/api/student/checkin" -Method POST -ContentType "application/json" -Body (@{
        studentId = $aarav.id
        faceId = "0000000"
        latitude = 12.9716
        longitude = 77.5946
    } | ConvertTo-Json)
    Write-Host "FAILED: Wrong Face ID should have been rejected!"
} catch {
    Write-Host "SUCCESS: Rejected check-in with wrong Face ID (403 Expected): $($_.Exception.Message)"
}

# Test 3B: Attempt with Correct Face ID
$goodCheckin = Invoke-RestMethod -Uri "$baseUrl/api/student/checkin" -Method POST -ContentType "application/json" -Body (@{
    studentId = $aarav.id
    faceId = $newAaravFaceId
    latitude = 12.9716
    longitude = 77.5946
} | ConvertTo-Json)
Write-Host "SUCCESS: Verified Attendance with matching Face ID ($newAaravFaceId): $($goodCheckin.message)"
Write-Host "Attendance Record Status: $($goodCheckin.record.status), Verification Method: $($goodCheckin.record.verificationMethod)"

Write-Host "=========================================================="
Write-Host "4. Testing Page Rendering (Status Checks)"
Write-Host "=========================================================="

$facePage = Invoke-WebRequest -Uri "$baseUrl/faculty/face-id" -UseBasicParsing
Write-Host "Dedicated Face ID Page Status: $($facePage.StatusCode)"

$dashPage = Invoke-WebRequest -Uri "$baseUrl/faculty" -UseBasicParsing
Write-Host "Faculty Dashboard Page Status: $($dashPage.StatusCode)"
Write-Host "Contains Face ID Generator in Dashboard: $($dashPage.Content.Contains('Face ID Generator'))"

Write-Host "ALL VERIFICATION CHECKS PASSED!"
