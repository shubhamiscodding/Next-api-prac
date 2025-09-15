import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const collection = await connectDB();
    
    const skip = (page - 1) * limit;
    const companies = await collection.find({}).skip(skip).limit(limit).toArray();
    const totalCompanies = await collection.countDocuments({});
    const totalPages = Math.ceil(totalCompanies / limit);
    
    // Convert ObjectId to string for JSON serialization
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString()
    }));
    
    return NextResponse.json({
      companies: cleanCompanies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCompanies,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error in GET /api/companies/paginate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
