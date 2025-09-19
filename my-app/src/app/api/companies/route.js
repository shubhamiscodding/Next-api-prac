import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 0;
    const page = parseInt(searchParams.get("page")) || 1;

    const collection = await connectDB();

    let companies;
    if (limit > 0) {
      const skip = (page - 1) * limit;
      companies = await collection.find({}).skip(skip).limit(limit).toArray();
    } else {
      companies = await collection.find({}).toArray();
    }

    const cleanCompanies = companies.map((company) => ({
      ...company,
      _id: company._id.toString(),
    }));

    const total = await collection.countDocuments();

    return NextResponse.json({
      count: total,
      items: cleanCompanies,
      page,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    console.error("Error in GET /api/companies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    const collection = await connectDB();

    const newCompany = {
      ...body,
      createdAt: new Date().toISOString(),
      benefits: body.benefits || [],
      interviewRounds: body.interviewRounds || [],
      hiringCriteria: body.hiringCriteria || {},
    };

    const result = await collection.insertOne(newCompany);

    return NextResponse.json(
      { ...newCompany, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/companies:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
