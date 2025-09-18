// app/api/companies/top-paid/route.js
import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    let limit = parseInt(url.searchParams.get('limit')) || 5;
    if (limit > 50) limit = 50;

    const client = await clientPromise;
    const db = client.db();
    const coll = db.collection("Companies");

    const items = await coll.find({})
      .sort({ baseSalary: -1 }) // highest to lowest
      .limit(limit)
      .toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/top-paid error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
