"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import ProfileEditIcon from "@/assets/icons/profile-edit.svg";
import Avatar from "@/components/avatar/Avatar";
import PageHeader from "@/components/page-header/PageHeader";
import TextInput from "@/components/text-input/TextInput";
import Toast from "@/components/toast/Toast";
import { cn } from "@/lib/cn";
import { updateProfile } from "../actions";
import { resizeAvatar } from "../resize-avatar";
import {
  type AvatarAction,
  type ProfileInput,
  type ProfileOutput,
  profileSchema,
} from "../schemas";
import AvatarSheet from "./AvatarSheet";

const FORM_ID = "profile-edit-form";
const TOAST_DURATION_MS = 2000;

/** 사진 상태: 원래 사진 그대로 / 새로 고른 사진(미리보기) / 기본 이미지로 */
type AvatarState =
  | { action: "keep" }
  | { action: "upload"; file: File; previewUrl: string }
  | { action: "remove" };

interface ProfileEditFormProps {
  nickname: string;
  /** 지금 저장된 사진 URL, 없으면 null(기본 이미지) */
  avatarUrl: string | null;
}

const ProfileEditForm = ({ nickname, avatarUrl }: ProfileEditFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    setFocus,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileInput, unknown, ProfileOutput>({
    resolver: zodResolver(profileSchema), // 서버와 같은 스키마로 검증
    // 한글 조합 중(ㅊ, ㅗ)에는 규칙에 걸리므로 포커스가 빠질 때 검사 (입력하면 에러 지움)
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { nickname },
  });

  // watch() 대신 useWatch: React Compiler와 함께 써도 값 변경이 반영됨
  const nicknameValue = useWatch({ control, name: "nickname" });

  const [avatar, setAvatar] = useState<AvatarState>({ action: "keep" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 blob URL은 바뀌거나 화면을 떠날 때 해제
  const previewUrl = avatar.action === "upload" ? avatar.previewUrl : null;
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  const shownAvatarUrl =
    avatar.action === "upload"
      ? avatar.previewUrl
      : avatar.action === "remove"
        ? null
        : avatarUrl;

  const nicknameChanged = nicknameValue.trim() !== nickname;
  const avatarChanged =
    avatar.action === "upload" ||
    (avatar.action === "remove" && avatarUrl !== null);
  // 바뀐 게 있고 규칙에 맞을 때만 저장 가능
  // (지운 직후에는 isValid가 갱신되기 전일 수 있어서 빈 값도 직접 막음)
  const canSave =
    (nicknameChanged || avatarChanged) &&
    isValid &&
    nicknameValue.trim().length > 0 &&
    !isSubmitting;

  const clearNickname = () => {
    setValue("nickname", "", { shouldValidate: false });
    clearErrors("nickname");
    setFocus("nickname");
  };

  const pickAlbum = () => {
    setSheetOpen(false);
    fileInputRef.current?.click();
  };

  const resetDefault = () => {
    setSheetOpen(false);
    setAvatar({ action: "remove" });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change가 일어나도록 비움
    event.target.value = "";
    if (!file) return;

    const resized = await resizeAvatar(file);
    if (!resized) {
      showToast("이 사진은 사용할 수 없어요.");
      return;
    }
    setAvatar({
      action: "upload",
      file: resized,
      previewUrl: URL.createObjectURL(resized),
    });
  };

  const onSubmit = async (values: ProfileOutput) => {
    const formData = new FormData();
    formData.set("nickname", values.nickname);
    const action: AvatarAction = avatarChanged ? avatar.action : "keep";
    formData.set("avatarAction", action);
    if (avatar.action === "upload") {
      formData.set("avatar", avatar.file);
    }

    // 성공하면 액션이 /my로 redirect → 돌아오는 값이 없을 수 있음
    const result = await updateProfile(formData);
    if (result?.error) {
      if (result.error.includes("닉네임")) {
        setError("nickname", { message: result.error });
      } else {
        showToast(result.error);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="프로필 편집"
        back={{ fallback: "/my" }}
        right={
          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSave}
            className={cn(
              "rounded-xs text-body1 font-semibold outline-none focus-visible:outline-2 focus-visible:outline-primary-40",
              canSave
                ? "cursor-pointer text-status-info"
                : "text-interaction-inactive",
            )}
          >
            저장
          </button>
        }
      />

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col"
      >
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar src={shownAvatarUrl} size={96} className="size-24" />
            <button
              type="button"
              aria-label="프로필 사진 변경"
              onClick={() => setSheetOpen(true)}
              className="absolute right-0 bottom-0 cursor-pointer rounded-full outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
            >
              <Image
                src={ProfileEditIcon}
                alt=""
                aria-hidden
                className="size-7"
              />
            </button>
          </div>
          <p className="max-w-full truncate text-heading1 font-bold">
            {nickname}
          </p>
        </div>

        <div className="mt-6">
          <TextInput
            id="nickname"
            tone="light"
            labelText="닉네임"
            autoComplete="nickname"
            placeholder="닉네임을 입력해 주세요"
            {...register("nickname", {
              onChange: () => clearErrors("nickname"),
            })}
            error={errors.nickname?.message}
            onClear={nicknameValue ? clearNickname : undefined}
          />
        </div>

        {/* 사진 고르기: 화면에는 안 보이고 시트의 [앨범에서 선택]이 대신 누름 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          // display:none이면 iOS 일부 버전에서 click()으로 안 열려서 sr-only로 숨김
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleFileChange}
        />
      </form>

      <AvatarSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPickAlbum={pickAlbum}
        onResetDefault={shownAvatarUrl ? resetDefault : undefined}
      />

      <Toast
        message={toastMessage}
        className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-5"
      />
    </>
  );
};

export default ProfileEditForm;
