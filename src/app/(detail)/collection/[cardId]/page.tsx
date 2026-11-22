import { notFound } from "next/navigation";
import { getMyCard } from "@/lib/cards/my-cards";
import { createClient } from "@/lib/supabase/server";
import CardDetail from "./_components/CardDetail";

const CardDetailPage = async ({
  params,
}: PageProps<"/collection/[cardId]">) => {
  const { cardId } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  // 남의 카드 · 없는 카드 · 비로그인이면 404
  const card = userId ? await getMyCard(supabase, userId, cardId) : null;

  if (!card) {
    notFound();
  }

  return <CardDetail card={card} />;
};

export default CardDetailPage;
