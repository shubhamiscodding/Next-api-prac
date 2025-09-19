// app/api/companies/by-skill/[skill]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { skill } = params;
    const collection = await connectDB();

    const items = await collection.find({
      "hiringCriteria.skills": { $regex: new RegExp(skill, 'i') }
    }).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/by-skill error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
