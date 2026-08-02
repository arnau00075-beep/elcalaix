const { getStore } = require('@netlify/blobs');

exports.handler = async function () {
  try {
    const store = getStore('comments');
    const comments = (await store.get('all', { type: 'json' })) || [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: comments.slice().reverse() })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'server error', comments: [] })
    };
  }
};
