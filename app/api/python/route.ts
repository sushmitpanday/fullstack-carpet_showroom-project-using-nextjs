import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ab ye direct Render ke live URL se connect karega
    const PYTHON_SERVER_URL = "https://fullstack-carpet-showroom-project-using-nextjs.onrender.com/analyze"; 

    console.log("Connecting to Render Python Backend at:", PYTHON_SERVER_URL);

    const response = await fetch(PYTHON_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Python Server Error: ${response.status}`);
    }

    const aiData = await response.json();
    return NextResponse.json(aiData);
    
  } catch (error: any) {
    console.error("PYTHON_BRIDGE_ERROR:", error.message);
    return NextResponse.json(
      { error: "PYTHON_SERVER_OFFLINE", details: error.message }, 
      { status: 500 }
    );
  }
}