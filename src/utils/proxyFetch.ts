// Proxy-aware fetch utility
// In the browser, routes external API requests through our Next.js server proxy
// to bypass CORS restrictions. On the server (SSR), fetches directly.

export function proxyFetch(url: string, options?: RequestInit): Promise<Response> {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const method = options?.method?.toUpperCase() || 'GET';
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

    if (method === 'POST') {
      return fetch(proxyUrl, {
        method: 'POST',
        headers: options?.headers as Record<string, string> || {},
        body: options?.body,
      });
    }

    return fetch(proxyUrl);
  }

  // Server-side: fetch directly
  return fetch(url, options);
}
