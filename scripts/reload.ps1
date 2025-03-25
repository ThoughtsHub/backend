Write-Output "Pulling from the latest commit"
git pull origin main
Write-Output "Pull complete"

Write-Output "Killing on running port $env:PORT"
npx kill-port $env:PORT
Write-Output "Kill complete"

Write-Output "Restarting application"
npm run start