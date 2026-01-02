export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Router configuration
  const routes = {
    "/waist-wrap": "https://waistmafia-wrap-landing.netlify.app",
    "/backless-hoodie": "https://auralo-backluxe-hoodie.netlify.app",
    "/arinadress": "https://arina-rhinestone-dress.netlify.app",
  };

  // Check if path matches any route
  for (const [route, target] of Object.entries(routes)) {
    if (path === route || path.startsWith(route + "/")) {
      // Build target URL
      const targetPath = path.replace(route, "");
      const targetUrl = target + targetPath + url.search;

      // Proxy the request
      return fetch(targetUrl, {
        headers: request.headers,
        method: request.method,
      });
    }
  }

  // No match - return 404
  return new Response("Product not found", { status: 404 });
};

export const config = { path: "/*" };
