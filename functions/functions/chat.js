export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ reply: 'No he rebut cap pregunta.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'Falta configurar la clau de la IA al servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = "Ets l'assistent d'una web catalana anomenada 'El Calaix', que ofereix eines i guies per al dia a dia (repartir comptes, estalvi, tràmits, salut, etc). Respon breu, clar i pràctic, en el mateix idioma amb què et pregunten. Si et demanen un càlcul, mostra el resultat numèric i els passos essencials. IMPORTANT: escriu sempre en text pla, sense markdown ni LaTeX — no facis servir asteriscs (**), coixinets (#), guions com a llista, ni notació matemàtica com \\times o \\{ \\}. Escriu els números i operacions de manera normal (per exemple: 20 x 30 = 600), com si ho escrivissis en un missatge de WhatsApp.";

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
      return new Response(JSON.stringify({ reply: 'Error de la IA: ' + (data.error?.message || 'desconegut') }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No he pogut generar una resposta, torna-ho a provar.';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ reply: 'Hi ha hagut un error processant la petició.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
