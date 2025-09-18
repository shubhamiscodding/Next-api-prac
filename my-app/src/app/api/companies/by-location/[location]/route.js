// app/api/companies/by-location/[location]/route.js
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { location } = params;

    const client = await clientPromise;
    const db = client.db();
    const coll = db.collection("Companies");

    const items = await coll.find({
      location: { $regex: new RegExp(location, 'i') }
    }).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/by-location error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
