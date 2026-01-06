// netlify/functions/anthropic.js

exports.handler = async function(event, context) {
    // 1. Handle CORS Preflight (The browser asks "Can I talk to you?" first)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // 2. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse the incoming body from your frontend
        const body = JSON.parse(event.body);
        const { systemPrompt, userContent, apiKey } = body;

        if (!apiKey) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing API Key" }) };
        }

        // 3. Make the server-to-server call to Anthropic
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey, // Pass the key sent from frontend
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
                'Access-Control-Allow-Origin': '*', // CORS Header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};