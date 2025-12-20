"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { Star, X, ExternalLink, Info, AlertTriangle, Clock, CheckCircle, Flame, Newspaper } from "lucide-react";

// ====== app/page.tsx と同じ定義（最低限だけコピー） ======
const CATEGORIES: Record<string, { label: string; color: string }> = {
  CREATIVE: { label: "クリエイティブ・表現", color: "bg-purple-100 text-purple-800" },
  SERVICE: { label: "商品・サービス・接客", color: "bg-orange-100 text-orange-800" },
  GOVERNANCE: { label: "コンプライアンス・組織", color: "bg-gray-100 text-gray-800" },
  COMMUNICATION: { label: "SNS・コミュニケーション", color: "bg-blue-100 text-blue-800" },
};

const SCORE_DEFINITIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "限定的", desc: "一部界隈で批判・引用RTで拡散" },
  2: { label: "軽微", desc: "SNS上で一定拡散（プチバズ）、検索上位に一時浮上" },
  3: { label: "中程度", desc: "複数プラットフォームに波及、まとめ・ニュース化、トレンドイン" },
  4: { label: "重大", desc: "ニュース・大手メディア・行政/業界団体が反応、TVCM取りやめ" },
  5: { label: "致命的", desc: "役員辞任・株価下落・行政指導・不買運動" },
};

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [favoritePostIds, setFavoritePostIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // ====== 初期ロード：ログイン確認 → favorites取得 → posts取得 ======
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const ok = !!session?.user;
      setIsLoggedIn(ok);

      if (!ok) {
        setFavoritePostIds([]);
        setPosts([]);
        setLoading(false);
        return;
      }

      const userId = session!.user.id;

      // 1) favorites から post_id を取得（新しい順）
      const { data: favRows, error: favErr } = await supabase
        .from("favorites")
        .select("post_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (favErr) {
        console.error(favErr);
        setFavoritePostIds([]);
        setPosts([]);
        setLoading(false);
        return;
      }

      const ids = (favRows || []).map((r: any) => r.post_id).filter((v: any) => typeof v === "number");
      setFavoritePostIds(ids);

      if (ids.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 2) posts をまとめて取得（公開だけに絞るなら status = published も）
      const { data: postRows, error: postErr } = await supabase
        .from("posts")
        .select("*")
        .in("id", ids)
        .eq("status", "published");

      if (postErr) {
        console.error(postErr);
        setPosts([]);
        setLoading(false);
        return;
      }

      // in() は順序が保証されないので、favorite順に並べ替え
      const order = new Map<number, number>();
      ids.forEach((id, idx) => order.set(id, idx));
      const sorted = (postRows || []).slice().sort((a: any, b: any) => {
        return (order.get(a.id) ?? 999999) - (order.get(b.id) ?? 999999);
      });

      setPosts(sorted);
      setLoading(false);
    })();
  }, []);

  const favoriteIdSet = useMemo(() => new Set(favoritePostIds), [favoritePostIds]);

  const removeFavorite = async (postId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // favorites から削除
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    // UI反映
    setFavoritePostIds(prev => prev.filter(id => id !== postId));
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (selectedIncident?.id === postId) setSelectedIncident(null);
  };

  const renderStars = (score: number) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Flame
          key={i}
          size={20}
          className={i < Math.floor(score) ? "fill-red-500 text-red-500" : "text-gray-300"}
        />
      ))}
      <span className="text-xl font-bold text-red-600 ml-2">{score?.toFixed(1)}</span>
    </div>
  );

  const DetailModal = () => {
    if (!selectedIncident) return null;
    const item = selectedIncident;

    const categoryType = item.categoryType || item.category_type;
    const categoryObj = CATEGORIES[categoryType] || { label: "カテゴリ不明", color: "bg-gray-100 text-gray-800" };
    const listingStatus = item.listingStatus || item.listing_status;
    const badMove = item.badMove || item.bad_move;
    const relatedLinks = item.relatedLinks || item.related_links || [];

    const relatedIds = item.relatedPostIds || item.related_post_ids || [];
    const relatedPosts = relatedIds.length > 0 ? posts.filter(p => relatedIds.includes(p.id)) : [];

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIncident(null)}>
        <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-900 text-white p-6 relative shrink-0">
            <button onClick={() => setSelectedIncident(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white bg-gray-800 p-1 rounded-full">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-2 opacity-80">
              <span className={`text-xs px-2 py-1 rounded ${categoryObj.color}`}>{categoryObj.label}</span>
              <span className="text-sm">{item.date} 発生</span>
              <span className="text-sm">| {item.industry}</span>
            </div>

            <h2 className="text-2xl font-bold mb-4">{item.title}</h2>

            <div className="flex gap-4 items-center">
              <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                <span className="text-xs text-gray-400 mr-2">影響度スコア</span>
                {renderStars(item.score)}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.id);
                }}
                className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-bold"
              >
                <Star size={16} className="text-yellow-300" />
                お気に入り解除
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Info size={16} className="mr-2" /> 炎上の経緯・概要</h3>
                <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{item.summary}</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center"><AlertTriangle size={16} className="mr-2" /> 企業への実害・インパクト</h3>
                <ul className="space-y-2">
                  {item.impact && item.impact.map((text: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span className="text-gray-800 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {item.timeline && item.timeline.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center"><Clock size={16} className="mr-2" /> タイムライン</h3>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="space-y-4">
                      {item.timeline.map((step: any, index: number) => (
                        <div key={index} className="border-b border-gray-200 pb-3">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-bold text-sm text-red-600">{step.day}</span>
                            <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center"><CheckCircle size={16} className="mr-2" /> 編集部の考察</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-blue-800 mb-1">要因分析</p>
                    <p className="text-gray-800 text-sm">{badMove}</p>
                  </div>
                  <div className="pt-4 border-t border-blue-200">
                    <p className="text-xs font-bold text-blue-800 mb-1">この事例からの学び</p>
                    <p className="text-gray-900 font-bold text-lg">"{item.lesson}"</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">企業属性データ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">企業名</span><span className="font-medium">{item.company}</span></div>
                  <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">業界</span><span className="font-medium">{item.industry}</span></div>
                  <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">上場区分</span><span className="font-medium">{listingStatus}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center"><Newspaper size={14} className="mr-2" /> 関連記事・メディア報道</h4>
                {relatedLinks && relatedLinks.length > 0 ? (
                  <ul className="text-sm space-y-2">
                    {relatedLinks.map((link: any, idx: number) => (
                      <li key={idx}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 hover:bg-gray-100 p-1.5 rounded transition">
                          <ExternalLink size={14} className="text-gray-400 mt-0.5 group-hover:text-blue-500" />
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">{link.source}</span>
                            <span className="text-gray-800 group-hover:text-blue-600 group-hover:underline leading-snug">{link.title}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-400">関連リンクはありません。</p>}
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2 text-sm">類似事例</h4>
                {relatedPosts.length > 0 ? (
                  <ul className="text-sm space-y-3 text-yellow-900">
                    {relatedPosts.map((relatedPost: any) => (
                      <li
                        key={relatedPost.id}
                        className="cursor-pointer hover:underline flex items-start gap-2"
                        onClick={() => setSelectedIncident(relatedPost)}
                      >
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{relatedPost.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-yellow-700">現在、関連付けられた類似事例はありません。</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">読み込み中...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">お気に入りはログインが必要です</h1>
          <p className="text-gray-600 mb-6">トップページからログインしてください。</p>
          <Link href="/" className="inline-block bg-gray-900 text-white px-5 py-3 rounded-lg font-bold">
            トップへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <Flame className="text-red-500 fill-red-500" size={28} />
            <span className="text-xl font-bold tracking-tight">炎上.com</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-300 hover:text-white">一覧へ戻る</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">お気に入り管理</h1>
            <p className="text-sm text-gray-500 mt-1">お気に入りにした事例を一覧で確認できます。</p>
          </div>
          <div className="text-sm text-gray-600 font-bold">
            全 {posts.length} 件
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            まだお気に入りがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((item) => {
              const categoryType = item.categoryType || item.category_type;
              const categoryObj = CATEGORIES[categoryType] || { label: "カテゴリ不明", color: "bg-gray-100 text-gray-800" };

              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer relative"
                  onClick={() => setSelectedIncident(item)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryObj.color}`}>{categoryObj.label}</span>
                        <span className="text-xs text-gray-400">{item.date} 発生</span>
                        <span className="text-xs text-gray-400">| {item.industry}</span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>

                      <div className="flex gap-2 mt-2">
                        {item.tags && item.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">影響度</div>
                        <div className="flex items-center gap-1">
                          <Flame size={16} className={item.score >= 4.0 ? "text-red-600 fill-red-600" : "text-red-500"} />
                          <span className={`text-2xl font-bold ${item.score >= 4.0 ? "text-red-600" : "text-gray-800"}`}>
                            {item.score?.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(item.id);
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-bold flex items-center gap-2"
                        aria-label="お気に入り解除"
                      >
                        <Star size={16} className="text-yellow-400" />
                        解除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedIncident && <DetailModal />}
      </main>
    </div>
  );
}