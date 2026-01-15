import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

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
      },
    });
    return NextResponse.json(newJob);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(jobs);
}