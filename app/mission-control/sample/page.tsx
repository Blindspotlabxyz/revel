import { redirect } from "next/navigation";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export default function SamplePage() {
  redirect(PUBLIC_SAMPLE_REPORT_PATH);
}