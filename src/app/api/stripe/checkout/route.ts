import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payments are not available in your region. All features are free." },
    { status: 503 }
  );
}
