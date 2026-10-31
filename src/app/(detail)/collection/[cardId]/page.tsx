import { notFound } from "next/navigation";
import { findCollectionCard } from "@/mocks/cards";
import CardDetail from "./_components/CardDetail";

const CardDetailPage = async ({
  params,
}: PageProps<"/collection/[cardId]">) => {
  const { cardId } = await params;
  const card = findCollectionCard(cardId);

  if (!card) {
    notFound();
  }

  return <CardDetail card={card} />;
};

export default CardDetailPage;
