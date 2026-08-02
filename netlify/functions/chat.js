exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'No he rebut cap pregunta.' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Falta configurar la clau de la IA al servidor.' })
      };
    }

    const systemInstruction = "Ets l'assistent d'una web catalana anomenada 'El Calaix', que ofereix eines i guies per al dia a dia (repartir comptes, estalvi, tràmits, salut, etc). Respon breu, clar i pràctic, en el mateix idioma amb què et pregunten. Si et demanen un càlcul, mostra el resultat numèric i els passos essencials.";

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Error de la IA: ' + (data.error?.message || 'desconegut') })
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No he pogut generar una resposta, torna-ho a provar.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Hi ha hagut un error processant la petició.' })
    };
  }
};
