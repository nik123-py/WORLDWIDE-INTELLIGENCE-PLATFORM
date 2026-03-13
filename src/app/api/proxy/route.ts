// Server-side API proxy to bypass CORS restrictions
// This runs on the Next.js server, so external APIs are accessible without CORS issues

import { NextRequest, NextResponse } from 'next/server';

// Allowed external API hosts (whitelist to prevent open proxy abuse)
const ALLOWED_HOSTS = [
  'opensky-network.org',
  'api.adsb.lol',
  'api.gdeltproject.org',
  'earthquake.usgs.gov',
  'eonet.gsfc.nasa.gov',
  'celestrak.org',
  'feodotracker.abuse.ch',
  'urlhaus-api.abuse.ch',
  'threatfox-api.abuse.ch',
  'lists.blocklist.de',
  'meri.digitraffic.fi',
  'ucdpapi.pcr.uu.se',
  'api.worldbank.org',
  'insecam.org',
  'www.submarinecablemap.com',
  'api.ioda.inetintel.cc.gatech.edu',
];

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const isAllowed = ALLOWED_HOSTS.some(host => parsedUrl.hostname.endsWith(host));

    if (!isAllowed) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    const headers: Record<string, string> = {
      'Accept': 'text/html,application/json,*/*;q=0.8',
      'User-Agent': request.headers.get('user-agent') || 'AEGIS-Intelligence-Platform/1.0',
    };

    if (parsedUrl.hostname.includes('insecam.org')) {
      headers['Referer'] = 'http://www.insecam.org/';
    }

    const response = await fetch(targetUrl, {
      headers,
      signal: AbortSignal.timeout(30000),
      redirect: 'follow', // Follow redirects
    });

    const contentType = response.headers.get('content-type') || '';
    
    // For HTML content (like insecam pages), we need to fetch the HTML 
    // and remove restrictive headers (like X-Frame-Options)
    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Fix relative URLs in the HTML so assets load correctly through the proxy or direct via absolute URLs
      if (parsedUrl.hostname.includes('insecam.org')) {
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        html = html.replace(/(src|href)=["']\/(?!\/)(.*?)["']/g, `$1="${baseUrl}/$2"`);
      }

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      // Intentionally NOT setting X-Frame-Options to allow embedding

      return new NextResponse(html, {
        status: response.status,
        headers,
      });
    }

    // Handle clean JSON passthrough vs Text
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text); // Try parsing anyway if text
      } catch {
        data = { response: text }; // Wrap raw text
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Proxy fetch failed', message: String(err) },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const isAllowed = ALLOWED_HOSTS.some(host => parsedUrl.hostname.endsWith(host));

    if (!isAllowed) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    const body = await request.text();
    const contentType = request.headers.get('content-type') || 'application/json';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept': 'application/json',
      'User-Agent': request.headers.get('user-agent') || 'AEGIS-Intelligence-Platform/1.0',
    };

    if (parsedUrl.hostname.includes('insecam.org')) {
      headers['Referer'] = 'http://www.insecam.org/';
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });

    const resContentType = response.headers.get('content-type') || '';
    const data = resContentType.includes('json') ? await response.json() : await response.text();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Proxy fetch failed', message: String(err) },
      { status: 502 }
    );
  }
}
