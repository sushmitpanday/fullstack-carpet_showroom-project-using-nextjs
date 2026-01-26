import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 Seconds timeout

  try {
    const body = await req.json();
    
    const response = await fetch('https://fullstack-carpet-showroom-project-using.onrender.com/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) return NextResponse.json({ error: 'Backend Offline' }, { status: 500 });
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("BRIDGE_ERROR:", error.message);
    return NextResponse.json({ error: 'Connection Timeout - Using Local Data' }, { status: 500 });
  }
}