import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // ✅ Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const collection = await connectDB();
    const company = await collection.findOne({ _id: new ObjectId(id) });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ ...company, _id: company._id.toString() });
  } catch (error) {
    console.error('GET /api/companies/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    // ✅ Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await req.json();
    const collection = await connectDB();
    const updateData = { ...body, updatedAt: new Date().toISOString() };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ...updatedCompany, _id: updatedCompany._id.toString() });
  } catch (error) {
    console.error('PUT /api/companies/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // ✅ Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const collection = await connectDB();
    const companyToDelete = await collection.findOne({ _id: new ObjectId(id) });

    if (!companyToDelete) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      message: 'Company deleted successfully',
      company: { ...companyToDelete, _id: companyToDelete._id.toString() },
    });
  } catch (error) {
    console.error('DELETE /api/companies/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
