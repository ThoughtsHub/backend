echo "Pulling from the latest commit"
git pull
echo "Pull complete"
echo

echo "Killing on running port"
npx kill-port 3002
echo "Kill complete"
echo

echo "Restarting application"
npm run rstart