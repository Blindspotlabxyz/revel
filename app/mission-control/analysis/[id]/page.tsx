import { AnalysisProgress } from "@/components/dashboard/analysis-progress";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Analysis in Progress</h1>
      <p className="mt-2 text-muted">
        Revel is investigating your product.
      </p>

      <div className="mt-8">
        <AnalysisProgress analysisId={id} />
      </div>
    </div>
  );
}