import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    const supabase = await createClient();
    const {error} = await supabase.from("keep_alive").select("id").limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/keep-alive] failed:", error);
    return NextResponse.json(
      {success: false, error: "Failed to reach Supabase"},
      {status: 500},
    );
  }
}
