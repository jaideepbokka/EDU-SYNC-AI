$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"FAC101EDUSYNC@gmail.com","password":"any","role":"FACULTY"}' -WebSession $session | Out-Null
$page = Invoke-WebRequest -Uri 'http://localhost:3000/faculty' -WebSession $session -UseBasicParsing
Write-Host "Authenticated /faculty Status:" $page.StatusCode
Write-Host "Contains 'Face ID Generator':" ($page.Content.Contains('Face ID Generator'))
