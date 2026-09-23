$res = Invoke-WebRequest -Uri 'http://localhost:3000/faculty/subjects' -UseBasicParsing
$contains = $res.Content.Contains('Course Offerings')
Write-Host "Contains 'Course Offerings': $contains"
