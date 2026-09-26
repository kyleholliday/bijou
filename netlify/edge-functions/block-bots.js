const BLOCKED =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Bytespider|PerplexityBot|Amazonbot|meta-externalagent|FacebookBot|Diffbot|cohere-ai|Timpibot|ImagesiftBot|PetalBot|SemrushBot|AhrefsBot|MJ12bot|DataForSeoBot/i;

export default async (request, context) => {
  const ua = request.headers.get('user-agent') || '';
  if (BLOCKED.test(ua)) {
    return new Response('Forbidden', { status: 403 });
  }
  return context.next();
};

export const config = { path: '/*', excludedPath: ['/robots.txt'] };
