import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * 매일 00:00(KST) 랭킹 집계 (vercel.json, Hobby라 최대 1시간 늦을 수 있음).
 * 기준 시각은 함수가 오늘 00:00으로 고정하므로 늦게 돌아도 결과는 같음
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  // CRON_SECRET이 비어 있으면 "Bearer undefined"로 통과되므로 먼저 막음
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("refresh_rankings");

  if (error) {
    console.error("[cron/rankings] 집계 실패", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
