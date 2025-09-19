// app/api/companies/[id]/push-round/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // ✅ Match test expectations: round must have a "name"
    if (!body.round || !body.round.name) {
      return NextResponse.json(
        { error: 'Round with name is required' },
        { status: 400 }
      );
    }

    const collection = await connectDB();
    const company = await collection.findOne({ _id: new ObjectId(id) });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // ✅ Push round into interviewRounds
    const newRound = body.round;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { interviewRounds: newRound },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      {
        ...updatedCompany,
        _id: updatedCompany._id.toString(),
        // ✅ Alias to match test expectation
        rounds: updatedCompany.interviewRounds || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/companies/[id]/push-round:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
