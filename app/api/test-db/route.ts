// app/api/test-db/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("🧪 Testing database connection...");
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
      NODE_ENV: process.env.NODE_ENV || "undefined"
    };
    
    console.log("Environment check:", envCheck);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL environment variable is missing",
        environment: envCheck
      }, { status: 500 });
    }

    // Test connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test basic query
    const userCount = await prisma.user.count();
    const transcriptCount = await prisma.interviewTranscript.count();
    
    console.log(`📊 Database stats: ${userCount} users, ${transcriptCount} transcripts`);

    // Test specific query that's failing
    const sampleTranscripts = await prisma.interviewTranscript.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        company: true,
        userId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Database connection and queries successful",
      environment: envCheck,
      stats: {
        users: userCount,
        transcripts: transcriptCount
      },
      sampleData: sampleTranscripts
    });

  } catch (error) {
    console.error("❌ Database test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}