import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json();
    const zai = await ZAI.create();

    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const completion = await zai.chat.completions.create({
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return Response.json({
      content: completion.choices[0]?.message?.content || '',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
