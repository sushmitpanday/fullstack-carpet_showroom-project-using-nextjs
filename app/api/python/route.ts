import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    data: { prediction: "READY_TO_SCAN", confidence: "100%" },
    similar: [] // Baad me AI logic yahan joda ja sakta hai
  });
}