import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!body.benefit) {
      return NextResponse.json({ error: 'Benefit is required' }, { status: 400 });
    }

    const collection = await connectDB();
    const company = await collection.findOne({ _id: new ObjectId(id) });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Add the benefit if it’s not already there
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $addToSet: { benefits: body.benefit },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { ...updatedCompany, _id: updatedCompany._id.toString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/companies/[id]/add-benefit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
