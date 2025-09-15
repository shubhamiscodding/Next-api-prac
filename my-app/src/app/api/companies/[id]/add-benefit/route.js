import { NextResponse } from 'next/server';
import { connectDB } from '../../../mongodb/route.js';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!body.benefit) {
      return NextResponse.json(
        { error: 'Benefit is required' },
        { status: 400 }
      );
    }
    
    const collection = await connectDB();
    
    const company = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    const benefits = company.benefits || [];
    
    if (!benefits.includes(body.benefit)) {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $addToSet: { benefits: body.benefit },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
    }
    
    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      ...updatedCompany,
      _id: updatedCompany._id.toString()
    });
  } catch (error) {
    console.error("Error in PATCH /api/companies/[id]/add-benefit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
