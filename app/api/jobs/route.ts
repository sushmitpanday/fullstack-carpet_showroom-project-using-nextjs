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
        gstNo: body.gstNo || "",
        
        // --- Financial Fields (Schema ke mutabiq String bhej rahe hain) ---
        amount: String(body.amount || "0"),
        calculatedProfit: String(body.calculatedProfit || "0"),
        wastageQuantity: String(body.wastageQuantity || "0"),

        // --- Naye Fields Jo Aapne Schema Mein Dale Hain ---
        hardboard: body.hardboard || "",
        glue: body.glue || "",
        scotia: body.scotia || "",
        disposal: body.disposal || "",
        labourItem: body.labourItem || "",
      },
    });

    return NextResponse.json(newJob);
  } catch (error: any) {
    console.error("DATABASE_ERROR:", error);
    // Error message detail mein dekhne ke liye isse update kiya
    return NextResponse.json({ error: error.message || "Database error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      // Agar Jobs page pe inventory items bhi chahiye toh include use kar sakte hain
      include: { inventoryItems: true } 
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}