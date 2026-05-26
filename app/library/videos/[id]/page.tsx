import { redirect } from "next/navigation";

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Redirect to library page
  redirect(`/library`);
}
