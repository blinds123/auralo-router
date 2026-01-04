const POOL_SERVER = 'https://simpleswap-automation-1.onrender.com';

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amountUSD, bundle, orderBump } = JSON.parse(event.body);

    console.log(`Processing order: $${amountUSD} (bundle: $${bundle}, bump: ${orderBump})`);

    // Call OnRender pool server
    const response = await fetch(`${POOL_SERVER}/get-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountUSD
      })
    });

    if (!response.ok) {
      throw new Error(`Pool server error: ${response.status}`);
    }

    const data = await response.json();

    // Return exchange URL to frontend
    // CRITICAL: OnRender returns "exchangeUrl" field
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        exchangeUrl: data.exchangeUrl || data.url,
        exchangeId: data.exchangeId || data.id,
        amount: amountUSD
      })
    };

  } catch (error) {
    console.error('Netlify function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process checkout',
        message: error.message
      })
    };
  }
};
