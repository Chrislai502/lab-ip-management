addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  const SECRET_TOKEN = "roarmeow"; // Consider moving to environment variables
  
  async function handleRequest(request) {
    const requestToken = request.headers.get("Authorization");
  
    if (!requestToken || requestToken !== `Bearer ${SECRET_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  
    if (request.method === "POST") {
      const requestData = await request.json();
      const ip = requestData.ip;
      const username = requestData.username;
  
      // Use environment variables for sensitive data
      const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${DNS_RECORD_ID}`;
      const headers = {
        "X-Auth-Email": CLOUDFLARE_EMAIL, // Set as environment variable
        "X-Auth-Key": CLOUDFLARE_API_KEY, // Set as environment variable
        "Content-Type": "application/json",
      };
  
      const body = JSON.stringify({
        type: "A",
        name: username,
        content: ip,
        ttl: 120, // Time to live in seconds
      });
  
      try {
        const response = await fetch(url, {
          method: "PUT", // Use PUT to update the record
          headers: headers,
          body: body,
        });
  
        if (response.ok) {
          return new Response("DNS record updated successfully", { status: 200 });
        } else {
          // Log or handle error response from Cloudflare
          return new Response("Failed to update DNS record", { status: response.status });
        }
      } catch (error) {
        return new Response("Error updating DNS record", { status: 500 });
      }
    } else {
      return new Response("Method not allowed", {status: 405});
    }
  }
  