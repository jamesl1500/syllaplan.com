import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeedData } from "@/lib/calendar/get-feed-data";
import { buildICSFeed } from "@/lib/calendar/ics";

const TOKEN_PATTERN = /^[0-9a-f]{32}$/;

// Unauthenticated by design — calendar apps (Google/Apple/Outlook) poll this
// URL directly and can't send a session cookie. The random token stands in
// for auth, so this always goes through the admin client, never RLS.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/feed/[token]">,
) {
  const { token } = await params;

  if (!TOKEN_PATTERN.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("calendar_feed_token", token)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const feedData = await getFeedData(admin, profile.id);
  const ics = buildICSFeed(feedData);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="syllaplan.ics"',
      "Cache-Control": "no-store",
    },
  });
}
