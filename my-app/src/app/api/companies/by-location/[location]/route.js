// app/api/companies/by-location/[location]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { location } = params;
    const collection = await connectDB();

    const items = await collection.find({
      location: { $regex: new RegExp(location, 'i') }
    }).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/by-location error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
