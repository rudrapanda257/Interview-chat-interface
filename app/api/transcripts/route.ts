// app/api/transcripts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface TranscriptWithUser {
  id: string;
  name: string;
  company: string;
  questions: any[];
  createdAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Fetching transcripts...");
    
    // Check database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Fetch transcripts with error handling
    const transcripts = await prisma.interviewTranscript.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📄 Found ${transcripts.length} transcripts`);

    // If no transcripts found, return empty array
    if (transcripts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        transcripts: [],
        message: "No transcripts found"
      });
    }

    const transcriptsWithUsers: TranscriptWithUser[] = [];

    // Process each transcript
    for (const transcript of transcripts) {
      try {
        console.log(`👤 Fetching user for transcript ${transcript.id}`);
        
        const user = await prisma.user.findUnique({
          where: { id: transcript.userId },
          select: {
            name: true,
            email: true,
          },
        });

        transcriptsWithUsers.push({
          id: transcript.id,
          name: transcript.name,
          company: transcript.company,
          questions: Array.isArray(transcript.questions) ? transcript.questions : [],
          createdAt: transcript.createdAt,
          userId: transcript.userId,
          user: {
            name: user?.name || transcript.name || "Unknown User",
            email: user?.email || null,
          },
        });

        console.log(`✅ Processed transcript ${transcript.id}`);
        
      } catch (userError) {
        console.warn(`⚠️ Failed to fetch user for transcript ${transcript.id}:`, userError);
        
        // Add transcript with fallback user data
        transcriptsWithUsers.push({
          id: transcript.id,
          name: transcript.name,
          company: transcript.company,
          questions: Array.isArray(transcript.questions) ? transcript.questions : [],
          createdAt: transcript.createdAt,
          userId: transcript.userId,
          user: {
            name: transcript.name || "Unknown User",
            email: null,
          },
        });
      }
    }

    console.log(`🎉 Successfully processed ${transcriptsWithUsers.length} transcripts`);

    return NextResponse.json({ 
      success: true, 
      transcripts: transcriptsWithUsers,
      count: transcriptsWithUsers.length
    });

  } catch (err) {
    console.error("❌ Error fetching transcripts:", err);

    // Detailed error logging
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }

    // Check for specific error types
    let errorMessage = "Server error";
    let statusCode = 500;

    if (err instanceof Error) {
      if (err.message.includes("DATABASE_URL")) {
        errorMessage = "Database configuration missing";
        statusCode = 500;
      } else if (err.message.includes("connect")) {
        errorMessage = "Cannot connect to database";
        statusCode = 503;
      } else if (err.message.includes("Prisma")) {
        errorMessage = "Database query error";
        statusCode = 500;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? 
        (err instanceof Error ? err.message : "Unknown error") : 
        undefined,
      transcripts: [] // Always return empty array for frontend compatibility
    }, { status: statusCode });

  } finally {
    // Disconnect from database
    await prisma.$disconnect();
    console.log("🔌 Database disconnected");
  }
}