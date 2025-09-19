// app/api/companies/search/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const location = searchParams.get('location'); // renamed from city → matches test
    const minBase = searchParams.get('minBase');
    const skill = searchParams.get('skill');

    const collection = await connectDB();

    // Build MongoDB query
    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minBase) {
      const minBaseSalary = parseInt(minBase, 10);
      if (!isNaN(minBaseSalary)) {
        query.baseSalary = { $gte: minBaseSalary };
      }
    }

    if (skill) {
      query['hiringCriteria.skills'] = { $regex: skill, $options: 'i' };
    }

    const companies = await collection.find(query).toArray();

    // Convert ObjectId to string for JSON serialization
    const cleanCompanies = companies.map(company => ({
      ...company,
      _id: company._id.toString(),
    }));

    return NextResponse.json(
      {
        count: cleanCompanies.length,
        items: cleanCompanies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/companies/search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
