// app/api/companies/headcount-range/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const min = parseInt(url.searchParams.get('min')) || 0;
    const max = url.searchParams.get('max') ? parseInt(url.searchParams.get('max')) : null;

    const collection = await connectDB();

    const filter = { headcount: { $gte: min } };
    if (max !== null) {
      filter.headcount.$lte = max;
    }

    const items = await collection.find(filter).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/headcount-range error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
