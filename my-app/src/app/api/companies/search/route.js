import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minBase = searchParams.get('minBase');
    const skill = searchParams.get('skill');
    
    const collection = await connectDB();
    
    // Build MongoDB query
    let query = {};
    
    if (city) {
      query.location = { $regex: city, $options: 'i' };
    }
    
    if (minBase) {
      const minBaseSalary = parseInt(minBase);
      query.baseSalary = { $gte: minBaseSalary };
    }
    
    if (skill) {
      query['hiringCriteria.skills'] = { $elemMatch: { $regex: skill, $options: 'i' } };
    }
    
    const companies = await collection.find(query).toArray();
    
    // Convert ObjectId to string for JSON serialization
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString()
    }));
    
    return NextResponse.json(cleanCompanies);
  } catch (error) {
    console.error("Error in GET /api/companies/search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
