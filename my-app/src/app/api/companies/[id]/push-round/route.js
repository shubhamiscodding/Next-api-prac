import { NextResponse } from 'next/server';
import { connectDB } from '../../../mongodb/route.js';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!body.round || !body.type) {
      return NextResponse.json(
        { error: 'Round and type are required' },
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
    
    const newRound = {
      round: body.round,
      type: body.type
    };
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { interviewRounds: newRound },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
    
    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      ...updatedCompany,
      _id: updatedCompany._id.toString()
    });
  } catch (error) {
    console.error("Error in PATCH /api/companies/[id]/push-round:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
