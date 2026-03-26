import { NextResponse } from 'next/server';

// GET all users (temporary dummy or empty)
export async function GET() {
  return NextResponse.json({ message: "Users API working" });
}
