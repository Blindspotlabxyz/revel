import { notFound } from "next/navigation";
import { GenesisReportBanner } from "@/components/dashboard/genesis-report-banner";
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

  const isGenesisReport = id === PUBLIC_SAMPLE_REPORT_ID;

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Analysis Report</h1>
      {isGenesisReport ? (
        <GenesisReportBanner website={analysis.website} />
      ) : null}
      <div className={isGenesisReport ? "mt-6" : "mt-8"}>
        <ReportTabs
          report={analysis.report}
          analysisId={analysis.id}
          website={analysis.website}
        />
      </div>
    </div>
  );
}