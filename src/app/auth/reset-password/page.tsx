"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // ← パスはあなたの構成に合わせて
// もし今のファイルが src/app/... 配下で、supabase が src/lib にあるなら ↑ が一般的
// いまの相対 import を続けるなら "../lib/..." などに合わせてOK

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setReady(!!data.user);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setReady(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ready) {
      alert("再設定メールのリンクからアクセスしてください（期限切れなら再送してください）。");
      return;
    }
    if (pw.length < 8) {
      alert("パスワードは8文字以上を推奨します");
      return;
    }
    if (pw !== pw2) {
      alert("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      alert("パスワードを更新しました。ログインしてください。");
      await supabase.auth.signOut();
      window.location.href = "/"; // ログイン導線に合わせて /login 等に変更
    } catch (err: any) {
      alert(err?.message ?? "更新に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h1 className="text-xl font-bold">新しいパスワードを設定</h1>

        {!ready && (
          <p className="text-sm text-gray-600">
            再設定リンクからアクセスしてください（期限切れなら再送してください）。
          </p>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="新しいパスワード"
            className="w-full border rounded-lg px-3 py-2"
            disabled={!ready || loading}
            required
          />
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="新しいパスワード（確認）"
            className="w-full border rounded-lg px-3 py-2"
            disabled={!ready || loading}
            required
          />
          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold disabled:opacity-60"
          >
            {loading ? "更新中..." : "パスワードを更新"}
          </button>
        </form>
      </div>
    </div>
  );
}