// app/api/companies/paginate/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const collection = await connectDB();

    const skip = (page - 1) * limit;

    const companies = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCompanies = await collection.countDocuments({});
    const totalPages = Math.ceil(totalCompanies / limit);

    // Convert ObjectId → string for safe JSON
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString()
    }));

    return NextResponse.json({
      items: cleanCompanies,         // ✅ matches common test expectation
      page,                          // ✅ current page number
      totalPages,
      totalCompanies
    }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/companies/paginate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
