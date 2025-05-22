import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching transcripts...");
    
    // Get transcripts without relationships first
    const transcripts = await prisma.interviewTranscript.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${transcripts.length} transcripts`);

    // Add user data manually by fetching users separately
    const transcriptsWithUsers = [];
    
    for (const transcript of transcripts) {
      try {
        // Try to find the user by ID
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
          questions: transcript.questions,
          createdAt: transcript.createdAt,
          userId: transcript.userId,
          user: {
            name: user?.name || transcript.name,
            email: user?.email || null,
          },
        });
      } catch (userError) {
        console.warn(`Failed to fetch user for transcript ${transcript.id}`);
        // Use transcript data as fallback
        transcriptsWithUsers.push({
          id: transcript.id,
          name: transcript.name,
          company: transcript.company,
          questions: transcript.questions,
          createdAt: transcript.createdAt,
          userId: transcript.userId,
          user: {
            name: transcript.name,
            email: null,
          },
        });
      }
    }

    return NextResponse.json({ success: true, transcripts: transcriptsWithUsers });
  } catch (err) {
    console.error("Error fetching transcripts:", err);
    
    return NextResponse.json({ 
      success: false,
      error: "Server error", 
      details: err instanceof Error ? err.message : "Unknown error",
      transcripts: []
    }, { status: 500 });
  }
}