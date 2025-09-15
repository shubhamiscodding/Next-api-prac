import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Body must be an array of companies' },
        { status: 400 }
      );
    }
    
    const collection = await connectDB();
    
    const newCompanies = body.map(company => {
      if (!company.name || !company.location) {
        throw new Error('Each company must have name and location');
      }
      
      return {
        ...company,
        createdAt: new Date().toISOString(),
        benefits: company.benefits || [],
        interviewRounds: company.interviewRounds || [],
        hiringCriteria: company.hiringCriteria || {}
      };
    });
    
    const result = await collection.insertMany(newCompanies);
    
    // Convert ObjectIds to strings for JSON serialization
    const insertedCompanies = newCompanies.map((company, index) => ({
      ...company,
      _id: result.insertedIds[index].toString()
    }));
    
    return NextResponse.json({
      inserted: insertedCompanies.length,
      companies: insertedCompanies
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/companies/bulk:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
