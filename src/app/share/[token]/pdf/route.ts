import { NextResponse } from "next/server";
import { reportForShareToken } from "@/lib/share";
import { renderReportPdf } from "@/lib/export/pdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resolved = await reportForShareToken(token);
  if (!resolved) return NextResponse.json({ error: "This link is no longer available." }, { status: 404 });
  const bytes = await renderReportPdf(resolved.report);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="support-shelf-shared-${resolved.report.from}-to-${resolved.report.to}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
