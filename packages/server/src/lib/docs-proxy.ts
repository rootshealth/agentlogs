const DOCS_ORIGIN = new URL("https://vibeinsights.mintlify.dev");
export const CUSTOM_DOCS_HOST = "agentlogs.ai";
const HOP_BY_HOP_HEADERS = ["content-encoding", "content-length", "transfer-encoding"];

export function getDocsProxyUrl(requestUrl: string): URL | null {
  const url = new URL(requestUrl);

  if (!url.pathname.startsWith("/docs")) {
    return null;
  }

  return new URL(`${url.pathname}${url.search}`, DOCS_ORIGIN);
}

export function createDocsProxyResponse(upstreamResponse: Response): Response {
  const headers = new Headers(upstreamResponse.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  return new Response(upstreamResponse.body, {
    headers,
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  });
}

export async function handleDocsProxy(request: Request): Promise<Response | null> {
  const proxyUrl = getDocsProxyUrl(request.url);

  if (!proxyUrl) {
    return null;
  }

  const proxyRequest = new Request(proxyUrl, request);
  proxyRequest.headers.set("Host", DOCS_ORIGIN.host);
  proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_DOCS_HOST);
  proxyRequest.headers.set("X-Forwarded-Proto", DOCS_ORIGIN.protocol.slice(0, -1));

  const upstreamResponse = await fetch(proxyRequest);

  return createDocsProxyResponse(upstreamResponse);
}
