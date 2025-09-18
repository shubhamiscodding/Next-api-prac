// app/api/companies/by-skill/[skill]/route.js
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { skill } = params;

    const client = await clientPromise;
    const db = client.db();
    const coll = db.collection("Companies");

    const items = await coll.find({
      "hiringCriteria.skills": { $regex: new RegExp(skill, 'i') }
    }).toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/by-skill error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
