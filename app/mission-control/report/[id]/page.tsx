import { notFound } from "next/navigation";
import { PUBLIC_SAMPLE_REPORT_ID } from "@/lib/public-sample-report";
import { getAnalysis } from "@/services/store";
import { sampleAnalysis } from "@/lib/sample-report";
import { ReportTabs } from "@/components/dashboard/report-tabs";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const analysis =
    id === "sample" ? sampleAnalysis : await getAnalysis(id);

  if (!analysis?.report) {
    notFound();
  }

  const isPublicSample = id === PUBLIC_SAMPLE_REPORT_ID;

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">
        {isPublicSample ? "Sample Report" : "Analysis Report"}
      </h1>
      {isPublicSample ? (
        <p className="mt-2 text-sm text-muted">
          A real Revel analysis — no sign-in required.
        </p>
      ) : null}
      <div className="mt-8">
        <ReportTabs
          report={analysis.report}
          analysisId={analysis.id}
          website={analysis.website}
        />
      </div>
    </div>
  );
}