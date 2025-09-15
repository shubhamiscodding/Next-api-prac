import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    const collection = await connectDB();
    
    if (location) {
      const locationCount = await collection.countDocuments({
        location: { $regex: location, $options: 'i' }
      });
      
      const total = await collection.countDocuments({});
      
      return NextResponse.json({
        total,
        locationCount,
        location
      });
    }
    
    // Get all companies and group by location
    const companies = await collection.find({}, { projection: { location: 1 } }).toArray();
    const total = companies.length;
    
    const locationCounts = companies.reduce((acc, company) => {
      const loc = company.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      total,
      byLocation: locationCounts
    });
  } catch (error) {
    console.error("Error in GET /api/companies/count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
