// Vercel serverless function for text editing
// Place this file at /api/edit.js in your Vercel project

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, guidance, api_key } = req.body;

    if (!text || !guidance) {
      return res.status(400).json({ error: 'Missing required fields: text and guidance' });
    }

    // Use OpenAI API (you'll need to set OPENAI_API_KEY in Vercel environment variables)
    const openaiApiKey = process.env.OPENAI_API_KEY || api_key;
    
    if (!openaiApiKey) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `You are a historical fiction editor specializing in experimental narrative techniques. Your task is to edit the provided paragraph according to the specific guidance below.

GUIDANCE:
${guidance}

PARAGRAPH TO EDIT:
${text}

Please edit this paragraph to align with the guidance. Return only the edited paragraph, no explanations or commentary.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled historical fiction editor who specializes in experimental narrative techniques. You edit text to conform to specific literary techniques while maintaining the original meaning and voice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: 'OpenAI API error', 
        details: errorData.error?.message || 'Unknown error' 
      });
    }

    const data = await response.json();
    const editedText = data.choices[0]?.message?.content?.trim();

    if (!editedText) {
      return res.status(500).json({ error: 'No edited text received from AI' });
    }

    return res.status(200).json({
      edited_text: editedText,
      original_text: text,
      guidance_used: guidance
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}