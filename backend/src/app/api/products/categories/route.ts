import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"


export async function GET(req: NextRequest) {
  try {
    const kategori = await prisma.category.findMany();
    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
