// Simple version for debugging
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Basic diagnostics
    const diagnostics = {
      nodeVersion: process.version,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      hasFetch: typeof fetch !== 'undefined',
      eventKeys: Object.keys(event),
      bodyLength: event.body ? event.body.length : 0
    };

    console.log('Diagnostics:', diagnostics);

    // Try to parse body
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON', 
          diagnostics 
        })
      };
    }

    const { text } = requestData;
    
    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'No text provided',
          received: requestData,
          diagnostics
        })
      };
    }

    // For now, just return a simple response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        edited_text: `[EDITED] ${text}`,
        analysis: 'This is a test response to verify the function is working.',
        original_text: text,
        diagnostics
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Function error',
        message: error.message,
        stack: error.stack
      })
    };
  }
};