import { z } from "zod";
import { nicknameField } from "@/app/(auth)/schemas";

/** /my/edit 폼 (클라이언트 · 서버 공통). 사진은 FormData의 파일로 따로 받음 */
export const profileSchema = z.object({ nickname: nicknameField });

/** 사진을 어떻게 할지: 그대로 / 새 사진 올리기 / 기본 이미지로 */
export const AVATAR_ACTIONS = ["keep", "upload", "remove"] as const;
export type AvatarAction = (typeof AVATAR_ACTIONS)[number];

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileOutput = z.output<typeof profileSchema>;
