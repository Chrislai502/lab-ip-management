/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Define global HTML template parts
const htmlHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Network Devices Status</title>
</head>
<body>
    <h1>Network Devices Status</h1>
    <ul>`;
const htmlFooter = `
    </ul>
</body>
</html>`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Temporary Secret
const SECRET_TOKEN = "roarmeow"; 

// Main request Handler
async function handleRequest(request) {
  const url = new URL(request.url);

  // Route for updating device IP and username
  if (url.pathname.startsWith("/update")) {
    return handleUpdate(request);
  } 
  // Route for viewing all device IPs and usernames
  else if (url.pathname.startsWith("/view")) {
    return handleView(request);
  } 
  // Handle undefined routes
  else {
    return new Response("Not Found", { status: 404 });
  }
}

// Handle IP and username updates
async function handleUpdate(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Check for secret token in the request header
  const requestToken = request.headers.get("Authorization");
  if (!requestToken || requestToken !== `Bearer ${SECRET_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { uniqueName, username, ip } = await request.json();
    // Composite key: combines uniqueName and username for uniqueness
    const key = `device-${uniqueName}`;
    const value = JSON.stringify({ username, ip });
    await DEVICE_DATA.put(key, value);
    return new Response("Device updated successfully", { status: 200 });
  } catch (e) {
    return new Response("Failed to update device", { status: 400 });
  }
}

// Serve webpage with list of devices
async function handleView(request) {
  let htmlContent = htmlHeader;
  const keys = await DEVICE_DATA.list();
  for (const key of keys.keys) {
    const data = await DEVICE_DATA.get(key.name);
    if (data) {
      const { username, ip } = JSON.parse(data);
      htmlContent += `<li>${key.name.replace('device-', '')} (User: ${username}) - IP: ${ip}</li>`;
    }
  }
  htmlContent += htmlFooter;
  return new Response(htmlContent, { headers: { 'Content-Type': 'text/html' }, status: 200 });
}
