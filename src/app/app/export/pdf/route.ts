import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { AccessError } from "@/lib/access";
import { ExportError, reportForRequest } from "@/lib/export/query";
import { renderReportPdf } from "@/lib/export/pdf";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await requireUser("/app/export");
  try {
    const { report, filename, options } = await reportForRequest(request.nextUrl.searchParams);
    const bytes = await renderReportPdf(report, options);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export function errorResponse(e: unknown) {
  if (e instanceof ExportError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof AccessError) return NextResponse.json({ error: e.message }, { status: 403 });
  return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
}
