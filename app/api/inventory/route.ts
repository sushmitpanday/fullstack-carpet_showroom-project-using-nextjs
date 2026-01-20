import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma client setup
const prisma = new PrismaClient();

// --- GET: Data Fetch karne ke liye ---
export async function GET() {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(inventory);
  } catch (error) {
    console.error("FETCH_ERROR:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH" }, { status: 500 });
  }
}

// --- POST: Data Save karne ke liye ---
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation: Check karein ki zaroori data aa raha hai
    if (!body.jobName || !body.description) {
      return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        jobName: body.jobName,
        description: body.description,
        quantity: String(body.quantity || "0"),
        notes: body.notes || "",
        imageUrl: body.imageUrl || "", // Base64 image yahan save hogi
        status: "Active"
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("SAVE_ERROR:", error);
    return NextResponse.json(
      { error: "Server Error: Could not save." }, 
      { status: 500 }
    );
  }
}

