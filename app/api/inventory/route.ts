import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Aapke schema ke mutabiq sahi model name 'inventoryItem' hai
    const inventory = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        jobName: true,      // Aapke schema mein 'jobName' hai 'name' nahi
        description: true,
        quantity: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("INVENTORY_FETCH_ERROR:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_INVENTORY" }, { status: 500 });
  }
}