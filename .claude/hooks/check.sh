#!/usr/bin/env bash
# Stop hook: Claude가 작업을 끝내려 할 때 tsc + biome check 실행
# - 실패하면 exit 2 → 에러를 Claude에게 돌려줘서 고치고 다시 끝내게 함
# - 코드 변경이 없으면 건너뜀

input=$(cat)

# 이미 이 hook 때문에 계속 작업 중이면 한 번 더 막지 않음 (무한 루프 방지)
if echo "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

# 커밋 안 된 코드 변경(ts, tsx, js, css, json)이 없으면 검사 안 함
changed=$(git status --porcelain -- '*.ts' '*.tsx' '*.js' '*.mjs' '*.css' '*.json' 2>/dev/null)
if [ -z "$changed" ]; then
  exit 0
fi

failed=0
report=""

if ! tsc_out=$(npx tsc --noEmit 2>&1); then
  failed=1
  report+=$'## npx tsc --noEmit 실패\n'"$(echo "$tsc_out" | head -40)"$'\n\n'
fi

if ! lint_out=$(npx biome check --colors=off --max-diagnostics=20 2>&1); then
  failed=1
  report+=$'## npm run lint (biome check) 실패\n'"$(echo "$lint_out" | tail -60)"$'\n\n'
fi

if [ "$failed" -eq 1 ]; then
  {
    echo "tsc / lint를 통과하지 못해서 아직 끝낼 수 없어요. 아래 에러를 고친 뒤 끝내 주세요."
    echo "(포맷 문제는 npm run format 으로 고칠 수 있음)"
    echo
    echo "$report"
  } >&2
  exit 2
fi

exit 0
