import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Next.js Bridge: Sending data to Render...");

    // Is URL ko dhyan se check karein (logs wala chota URL)
    const response = await fetch('https://fullstack-carpet-showroom-project-using.onrender.com/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Render Side Error:", data);
      return NextResponse.json({ error: 'Backend Error', details: data }, { status: response.status });
    }

    console.log("Render Success! Match Found.");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("BRIDGE_ERROR:", error.message);
    return NextResponse.json({ error: 'Bridge Connection Failed' }, { status: 500 });
  }
}