const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { name, text } = JSON.parse(event.body || '{}');

    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'empty comment' })
      };
    }

    const store = getStore('comments');
    const existing = (await store.get('all', { type: 'json' })) || [];

    existing.push({
      name: name && name.trim() ? name.trim().slice(0, 40) : 'Anònim',
      text: text.trim().slice(0, 500),
      date: new Date().toISOString()
    });

    // Keep only the most recent 300 comments so storage doesn't grow forever
    const trimmed = existing.slice(-300);

    await store.setJSON('all', trimmed);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'server error' })
    };
  }
};
