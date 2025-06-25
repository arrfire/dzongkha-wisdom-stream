// netlify/edge-functions/claude-api.js
// Create this file instead of the .ts version to avoid TypeScript warnings

export default async (request, context) => {
  // Handle preflight CORS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Get API key from environment
  const apiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    console.error('CLAUDE_API_KEY not found in environment variables');
    return new Response(JSON.stringify({ error: 'API key not configured' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Log API key presence (don't log the actual key for security)
  console.log('API key found, length:', apiKey.length);
  console.log('API key starts with:', apiKey.substring(0, 10) + '...');

  try {
    const body = await request.json();
    
    console.log('Forwarding request to Claude API...');
    
    // Forward request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('Claude API response status:', response.status);
    
    // Check for API errors
    if (!response.ok) {
      console.error('Claude API error:', data);
      return new Response(JSON.stringify({ 
        error: 'Claude API error', 
        details: data,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return response with CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const config = { path: "/api/claude" };