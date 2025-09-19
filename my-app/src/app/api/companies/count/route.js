// app/api/companies/count/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const location = url.searchParams.get('location');
    const skill = url.searchParams.get('skill');

    const collection = await connectDB();

    const filter = {};
    if (name) filter.name = { $regex: new RegExp(name, 'i') };
    if (location) filter.location = { $regex: new RegExp(location, 'i') };
    if (skill) filter['hiringCriteria.skills'] = { $regex: new RegExp(skill, 'i') };

    const total = await collection.countDocuments(filter);

    return NextResponse.json({ total }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/count error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
