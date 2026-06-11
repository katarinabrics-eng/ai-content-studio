import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getClientProjectByShortCode } from "@/lib/supabase-client-projects";

type Props = { params: Promise<{ shortCode: string }> };

export const dynamic = "force-dynamic";

export default async function ShortLinkPage({ params }: Props) {
  const { shortCode } = await params;
  const project = await getClientProjectByShortCode(shortCode);
  if (!project?.access_token) notFound();
  redirect(`/diagnostika/view?token=${encodeURIComponent(project.access_token)}`);
}
