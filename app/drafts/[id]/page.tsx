import { redirect } from "next/navigation";

export default function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Redirect to history detail page
  redirect(`/history`);
}
