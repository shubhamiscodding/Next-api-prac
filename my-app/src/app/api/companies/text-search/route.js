import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const skill = searchParams.get('skill');

    const collection = await connectDB();

    // Build MongoDB query
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (skill) {
      const skillQuery = { 'hiringCriteria.skills': { $regex: skill, $options: 'i' } };
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, skillQuery] };
      } else {
        query = skillQuery;
      }
    }

    const companies = await collection.find(query).toArray();

    // Convert ObjectId to string
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString()
    }));

    // ✅ Return count + items to match test expectation
    return NextResponse.json(
      {
        count: cleanCompanies.length,
        items: cleanCompanies
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/companies/text-search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
