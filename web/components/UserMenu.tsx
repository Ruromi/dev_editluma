import { createServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import Link from "next/link";

export default async function UserMenu() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
      >
        로그인
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "사용자";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm text-gray-300 hidden sm:inline max-w-[120px] truncate">
          {displayName}
        </span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
