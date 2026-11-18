import NarrowColumn from "@/components/narrow-column/NarrowColumn";

/** 컬렉션은 아직 반응형 전이라 태블릿 · 데스크톱에서도 모바일 폭으로 */
const CollectionLayout = ({ children }: LayoutProps<"/collection">) => {
  return <NarrowColumn>{children}</NarrowColumn>;
};

export default CollectionLayout;
