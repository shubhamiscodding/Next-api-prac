// app/api/companies/benefit/[benefit]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { benefit } = params;
    const collection = await connectDB();

    const items = await collection.find({
      benefits: { $regex: new RegExp(benefit, 'i') }
    }).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/benefit error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
