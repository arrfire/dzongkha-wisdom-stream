// netlify/edge-functions/test-env.js
// Temporary function to test if API key is accessible

export default async (request, context) => {
  const apiKey = Deno.env.get('CLAUDE_API_KEY');
  
  return new Response(JSON.stringify({
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyStart: apiKey ? apiKey.substring(0, 15) + '...' : 'None',
    allEnvVars: Object.keys(Deno.env.toObject())
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: "/api/test-env" };