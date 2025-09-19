// app/api/companies/top-paid/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let limit = parseInt(searchParams.get('limit')) || 5;
    if (limit > 50) limit = 50;

    const collection = await connectDB();

    // ✅ Query using salaryBand.base
    const items = await collection
      .find({ 'salaryBand.base': { $exists: true, $ne: null } })
      .sort({ 'salaryBand.base': -1 }) // highest to lowest
      .limit(limit)
      .toArray();

    // Convert ObjectId → string
    const cleanItems = items.map(company => ({
      ...company,
      _id: company._id.toString(),
      baseSalary: company.salaryBand?.base ?? null, // expose as baseSalary for tests
    }));

    return NextResponse.json({ items: cleanItems }, { status: 200 });
  } catch (err) {
    console.error('GET /api/companies/top-paid error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
