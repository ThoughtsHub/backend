import { exec } from "child_process";

// Helper function to execute shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject(stderr || err);
      else resolve(stdout);
    });
  });
}

async function startRedis() {
  try {
    // Check if Redis container is running
    const runningContainers = await runCommand(
      'docker ps --filter "name=redis-container" --filter "status=running"'
    );
    if (runningContainers.includes("redis-container")) {
      console.log("Redis container is already running.");
      return;
    }

    // Check if Redis container exists but is stopped
    const allContainers = await runCommand(
      'docker ps -a --filter "name=redis-container"'
    );
    if (allContainers.includes("redis-container")) {
      console.log("Starting existing Redis container...");
      await runCommand("docker start redis-container");
      console.log("Redis container started.");
      return;
    }

    // Check if Redis image is available locally
    const images = await runCommand(
      'docker images redis --format "{{.Repository}}"'
    );
    if (!images.includes("redis")) {
      console.log("Redis image not found. Pulling the Redis image...");
      await runCommand("docker pull redis");
      console.log("Redis image pulled.");
    }

    // Create and start a new Redis container
    console.log("Creating and starting a new Redis container...");
    await runCommand("docker run --name redis-container -d -p 6379:6379 redis");
    console.log("Redis container created and started.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Start the process
startRedis();
