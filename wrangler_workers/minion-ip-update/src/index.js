/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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
    const key = `device-${uniqueName}`;

    // Get current date/time in PST
    const date = new Date();
    const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const lastUpdated = pstDate.toISOString().split('T').join(' ').slice(0, 19); // Format as 'YYYY-MM-DD HH:MM:SS'
    const value = JSON.stringify({ username, ip, lastUpdated });
    
    await DEVICE_DATA.put(key, value);
    return new Response("Device updated successfully", { status: 200 });
  } catch (e) {
    return new Response("Failed to update device", { status: 400 });
  }
}

// Serve webpage with list of devices in a styled table
// <style>
//     /* Existing CSS styles... */
//     table { width: 100%; border-collapse: collapse; }
//     th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
//     /* Additional styles... */
// </style>
async function handleView(request) {
  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ROAR Network Devices Current IP</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
      h1 { color: #333; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
      th { background-color: #4CAF50; color: white; }
      tr:nth-child(even) { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Network Devices Status</h1>
    <table>
        <tr>
            <th>Computer Name</th>
            <th>Users / Usernames</th>
            <th>IP Address</th>
            <th>Last Updated</th>
        </tr>`;

  const keys = await DEVICE_DATA.list();
  for (const key of keys.keys) {
    const data = await DEVICE_DATA.get(key.name);
    if (data) {
      const { username, ip, lastUpdated } = JSON.parse(data);
      const formattedTime = new Date(lastUpdated).toLocaleString();
      const userNamesFormatted = username.split(",").join("<br>"); // Split by comma, join with HTML break line
      htmlContent += `
        <tr>
            <td>${key.name.replace("device-", "")}</td>
            <td>${userNamesFormatted}</td>
            <td>${ip}</td>
            <td>${formattedTime}</td>
        </tr>`;
    }
  }

  htmlContent += `
    </table>
</body>
</html>`;

  return new Response(htmlContent, { headers: { 'Content-Type': 'text/html' }, status: 200 });
}
