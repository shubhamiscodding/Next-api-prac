import { NextResponse } from 'next/server';
import { connectDB } from '../../mongodb/route.js';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const collection = await connectDB();
    
    const company = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Convert ObjectId to string for JSON serialization
    const cleanCompany = {
      ...company,
      _id: company._id.toString()
    };
    
    return NextResponse.json(cleanCompany);
  } catch (error) {
    console.error("Error in GET /api/companies/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const collection = await connectDB();
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    const updatedCompany = await collection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      ...updatedCompany,
      _id: updatedCompany._id.toString()
    });
  } catch (error) {
    console.error("Error in PUT /api/companies/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const collection = await connectDB();
    
    const companyToDelete = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!companyToDelete) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      message: 'Company deleted successfully',
      company: {
        ...companyToDelete,
        _id: companyToDelete._id.toString()
      }
    });
  } catch (error) {
    console.error("Error in DELETE /api/companies/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
