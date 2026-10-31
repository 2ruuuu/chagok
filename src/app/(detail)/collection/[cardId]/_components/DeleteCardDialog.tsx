"use client";

import Button from "@/components/button/Button";
import Dialog from "@/components/dialog/Dialog";

const TITLE_ID = "delete-card-dialog-title";
const DESC_ID = "delete-card-dialog-desc";

interface DeleteCardDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 카드 삭제 확인 창 */
const DeleteCardDialog = ({ open, onClose }: DeleteCardDialogProps) => {
  // TODO: 카드 삭제 (DB 생기면 서버 액션 → 성공 시 컬렉션으로 replace)
  const handleDelete = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      describedBy={DESC_ID}
    >
      <div className="pt-3 text-center text-body1 font-medium">
        <h2 id={TITLE_ID}>카드를 삭제할까요?</h2>
        <p id={DESC_ID}>삭제한 카드는 복구할 수 없어요.</p>
      </div>
      <div className="mt-6 flex gap-2.5">
        <Button
          type="button"
          variant="neutral"
          className="flex-1"
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="button" className="flex-1" onClick={handleDelete}>
          삭제하기
        </Button>
      </div>
    </Dialog>
  );
};

export default DeleteCardDialog;
