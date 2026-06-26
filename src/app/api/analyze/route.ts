import { NextRequest, NextResponse } from "next/server";
import type { AnalyzeRequest } from "@/lib/types";
import { runPlaytest } from "@/lib/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.economy) {
      return NextResponse.json(
        { error: "Economy data is required" },
        { status: 400 }
      );
    }

    const report = await runPlaytest(body);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
