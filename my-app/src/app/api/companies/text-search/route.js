import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';

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
      const skillQuery = { 'hiringCriteria.skills': { $elemMatch: { $regex: skill, $options: 'i' } } };
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, skillQuery] };
      } else {
        query = skillQuery;
      }
    }
    
    const companies = await collection.find(query).toArray();
    
    // Convert ObjectId to string for JSON serialization
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString()
    }));
    
    return NextResponse.json(cleanCompanies);
  } catch (error) {
    console.error("Error in GET /api/companies/text-search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
