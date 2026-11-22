import { requireEnv } from "@/lib/env";

/**
 * 새 검수 요청이 들어오면 디스코드 채널로 알림 (서버에서만 호출).
 * 웹훅 URL을 아는 사람은 누구나 채널에 글을 쓸 수 있어서 NEXT_PUBLIC_ 금지.
 * 알림이 실패해도 인증 요청은 성공해야 하므로 여기서 에러를 삼키고 로그만 남김.
 */
export const notifyPendingTicket = async (message: string) => {
  try {
    const url = requireEnv(
      process.env.DISCORD_WEBHOOK_URL,
      "DISCORD_WEBHOOK_URL",
    );

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      console.error(`디스코드 알림 실패: ${response.status}`);
    }
  } catch (error) {
    console.error("디스코드 알림 실패", error);
  }
};
