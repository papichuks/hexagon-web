import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // Prefer using Pinata SDK when possible; fall back to HTTP API with JWT
    // For maximum compatibility with multi-file directory uploads, forward the
    // multipart body to Pinata's pinFileToIPFS endpoint.
    const forward = new FormData();

    // Forward all incoming `file` parts and known pinata fields
    for (const [key, value] of form.entries()) {
      if (key === 'file' && value instanceof File) {
        forward.append('file', value, value.name);
      } else if (key === 'pinataMetadata' || key === 'pinataOptions') {
        forward.append(key, String(value));
      }
    }

    // If caller did not provide options, default to wrapWithDirectory for consistency
    if (!form.has('pinataOptions')) {
      forward.append(
        'pinataOptions',
        JSON.stringify({ wrapWithDirectory: true })
      );
    }

    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json(
        { error: 'Server missing PINATA_JWT' },
        { status: 500 }
      );
    }

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: forward,
      // Next.js will set appropriate boundary for multipart
    });

    if (!res.ok) {
      let text = await res.text().catch(() => '');
      try {
        const j = JSON.parse(text);
        text = JSON.stringify(j);
      } catch {}
      console.error('Pinata upload failed', res.status, text);
      return NextResponse.json(
        { error: `Pinata upload failed: ${res.status} ${text}` },
        { status: 500 }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    console.error('IPFS upload route error', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}
