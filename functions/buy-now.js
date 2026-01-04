const NETLIFY_RESPONSE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const HANDLER = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: NETLIFY_RESPONSE_HEADERS,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: NETLIFY_RESPONSE_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { amount, currency, productName } = JSON.parse(event.body);

    // Call SimpleSwap pool server
    const POOL_SERVER = "https://simpleswap-automation-1.onrender.com";
    const response = await fetch(`${POOL_SERVER}/api/create-exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: currency || "USD",
        productName: productName || "Auralo Corset",
      }),
    });

    const data = await response.json();

    // Return with exchangeUrl field (OnRender returns this, not checkoutUrl)
    return {
      statusCode: 200,
      headers: NETLIFY_RESPONSE_HEADERS,
      body: JSON.stringify({
        exchangeUrl: data.exchangeUrl || data.checkoutUrl || data.url,
        success: true,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: NETLIFY_RESPONSE_HEADERS,
      body: JSON.stringify({
        error: "Failed to create exchange",
        message: error.message,
      }),
    };
  }
};

export { HANDLER };
