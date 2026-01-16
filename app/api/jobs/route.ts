import { NextResponse } from 'next/server'; // 1. Ye zaroori hai error 23 ke liye
import { prisma } from '@/app/lib/prisma';   // 2. Ye zaroori hai error 4 ke liye

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newJob = await prisma.job.create({
      data: {
        jobId: body.jobId,
        clientName: body.clientName,
        siteAddress: body.siteAddress,
        status: "WIP",
        email: body.email || "",
        phone: body.phone || "",
        
        // Financial fields
        gstNo: body.gstNo || "",
        amount: parseFloat(body.amount) || 0,
        costPrice: parseFloat(body.cost) || 0,
        salePrice: parseFloat(body.sell) || 0,
      },
    });
    return NextResponse.json(newJob);
  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}