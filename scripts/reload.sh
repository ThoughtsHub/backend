echo "Pulling from the latest commit"
git pull origin main
echo "Pull complete"

echo "Killing on running port $PORT"
npx kill-port $PORT
echo "Kill complete"

echo "Restarting application"
npm i
npm run start
