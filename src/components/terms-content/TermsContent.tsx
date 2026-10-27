import type { TermsBlock, TermsDoc } from "@/constants/terms";

interface BlockProps {
  block: TermsBlock;
}

const Block = ({ block }: BlockProps) => {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-caption1">
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    scope="col"
                    className="border border-line-normal bg-background-transparent-normal px-2 py-2 font-semibold text-common-0"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell) => (
                    <td
                      key={cell}
                      className="border border-line-normal px-2 py-2 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
};

interface TermsContentProps {
  doc: TermsDoc;
}

/** 약관 본문. 어두운 배경 기준 (약관 상세 화면, /terms 페이지) */
const TermsContent = ({ doc }: TermsContentProps) => {
  return (
    <div className="flex flex-col gap-6 text-body2 text-neutral-10">
      {doc.sections.map((section, index) => (
        <section key={section.heading ?? index} className="flex flex-col gap-2">
          {section.heading && (
            <h2 className="text-label1 text-common-0">{section.heading}</h2>
          )}
          {section.blocks.map((block, blockIndex) => (
            // 블록 순서는 바뀌지 않는 정적 데이터
            // biome-ignore lint/suspicious/noArrayIndexKey: static content
            <Block key={blockIndex} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
};

export default TermsContent;
