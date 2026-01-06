// netlify/functions/anthropic.js

exports.handler = async function(event, context) {
    // 1. Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // 2. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Method Not Allowed' }) 
        };
    }

    try {
        // Parse the incoming body from your frontend
        // We no longer expect or need 'apiKey' to be sent from the browser
        const body = JSON.parse(event.body);
        const { systemPrompt, userContent } = body;

        // Pull the key from Netlify Environment Variables
        const serverSideKey = process.env.ANTHROPIC_API_KEY;

        if (!serverSideKey) {
            console.error("Environment variable ANTHROPIC_API_KEY is missing in Netlify settings.");
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Server Configuration Error: API Key not found." }) 
            };
        }

        // 3. Make the server-to-server call to Anthropic
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': serverSideKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userContent
                }]
            })
        });

        const data = await response.json();

        // 4. Return the response to your frontend
        return {
            statusCode: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Function Error:", error.message);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};