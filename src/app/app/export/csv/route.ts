import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { AccessError } from "@/lib/access";
import { ExportError, reportForRequest } from "@/lib/export/query";
import { reportToCsv } from "@/lib/export/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await requireUser("/app/export");
  try {
    const { report, filename } = await reportForRequest(request.nextUrl.searchParams);
    return new NextResponse(reportToCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ExportError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof AccessError) return NextResponse.json({ error: e.message }, { status: 403 });
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
