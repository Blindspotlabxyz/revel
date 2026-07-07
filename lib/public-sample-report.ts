/** Public showcase report — no sign-in required. */
export const PUBLIC_SAMPLE_REPORT_ID =
  "89a99571-be09-4aa1-a8aa-17ff1cb5bdf3";

export const PUBLIC_SAMPLE_REPORT_PATH = `/mission-control/report/${PUBLIC_SAMPLE_REPORT_ID}`;

export function isPublicSampleReportPath(pathname: string): boolean {
  return (
    pathname === PUBLIC_SAMPLE_REPORT_PATH ||
    pathname === "/mission-control/sample"
  );
}