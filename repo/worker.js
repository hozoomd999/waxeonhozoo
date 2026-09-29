import { json, corsHeaders, hashPassword, verifyPassword, generateToken, verifyToken } from './utils.js';
import { handleAuth } from './auth.js';
import { handleChat } from './chat.js';
import { handleUpload } from './upload.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      if (path.startsWith('/api/auth')) return await handleAuth(request, env, path);
      if (path.startsWith('/api/chat')) return await handleChat(request, env, path);
      if (path.startsWith('/api/upload')) return await handleUpload(request, env);
      if (path.startsWith('/api/notif')) return await handleNotif(request, env);

      // Fallback ke static assets (HTML, CSS, JS)
      return env.ASSETS.fetch(request);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};

async function handleNotif(request, env) {
  const user = await verifyToken(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(user.id).all();
  return json(results);
}
