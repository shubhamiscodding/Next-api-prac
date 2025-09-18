// app/api/companies/count/route.js
import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const location = url.searchParams.get('location');
    const skill = url.searchParams.get('skill');

    const client = await clientPromise;
    const db = client.db();
    const coll = db.collection("Companies");

    const filter = {};
    if (name) filter.name = { $regex: new RegExp(name, 'i') };
    if (location) filter.location = { $regex: new RegExp(location, 'i') };
    if (skill) filter['hiringCriteria.skills'] = { $in: [skill] };

    const total = await coll.countDocuments(filter);

    return NextResponse.json({ total }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/count error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
