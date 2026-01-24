"use client";

import React, { useState, useEffect, useCallback, useRef} from 'react';
import { 
  Flame, Mail, Lock, ArrowRight, Building2, User, CheckCircle, 
  AlertCircle, Eye, EyeOff, ShieldCheck, Briefcase, ArrowLeft, Send, FileText,
  AlertTriangle, TrendingUp, BarChart2, Shield, ChevronRight, X, Info, 
  Clock, ArrowDown, Settings, LogOut, CreditCard, Bell, Filter, Calendar, Link as LinkIcon, ExternalLink, Newspaper, Building, ChevronDown, Star,
  AArrowDown
} from 'lucide-react';
import Link from "next/link";
// Supabase接続を有効化
import { supabase } from '../lib/supabaseClient';

// --- フリーアドレス定数定義 ---
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.co.jp', 'hotmail.com', 'outlook.com', 'icloud.com','ezweb.ne.jp', 'au.com', 'docomo.ne.jp', 'softbank.ne.jp', 'i.softbank.jp'];

const CATEGORIES = {
  CREATIVE: { label: 'クリエイティブ表現', color: 'bg-purple-100 text-purple-800' }, 
  SERVICE: { label: '商品・サービス・接客', color: 'bg-orange-100 text-orange-800' }, 
  GOVERNANCE: { label: '企業コンプライアンス', color: 'bg-gray-100 text-gray-800' }, 
  COMMUNICATION: { label: 'SNSコミュニケーション', color: 'bg-blue-100 text-blue-800' }, 
};

const INDUSTRIES = ["水産・農林業", "鉱業", "建設業", "製造業", "電気・ガス業", "運輸・情報通信業", "商業", "金融・保険業", "不動産業", "サービス業", "非営利"];
const LISTING_STATUSES = ["未上場", "東証プライム", "東証スタンダード", "東証グロース", "海外上場", "その他"];

// 影響度スコアの定義
const SCORE_DEFINITIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "限定的", desc: "一部界隈で批判・引用RTで拡散" },
  2: { label: "軽微", desc: "SNS上で一定拡散（プチバズ）、検索上位に一時浮上" },
  3: { label: "中程度", desc: "複数プラットフォームに波及、まとめ・ニュース化、トレンドイン" },
  4: { label: "重大", desc: "ニュース・大手メディア・行政/業界団体が反応、TVCM取りやめ" },
  5: { label: "致命的", desc: "役員辞任・株価下落・行政指導・不買運動" },
};

// ==========================================
// 1. ダッシュボードコンポーネント (Service Screen)
// ==========================================
const Dashboard = ({
  isLoggedIn,
  onShowAuth,
  onLogout
}: {
  isLoggedIn: boolean,
  onShowAuth: (mode?: string, source?: string) => void,
  onLogout: () => void | Promise<void>
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'account'>('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [page, setPage] = useState(1);

  // プロフィール設定画面
  useEffect(() => {
  const loadProfile = async () => {
    if (!isLoggedIn) {
      setUserProfile(null);
      setActiveTab("dashboard");
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setUserProfile(null);
      return;
    }

    const emailVerified = !!(user.email_confirmed_at ?? (user as any).confirmed_at);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("company, department, name")
      .eq("id", user.id)
      .single();

    if (profErr) {
      // なくても動くようにする（初回未作成など）
      console.warn("profile load error:", profErr.message);
    }

    setUserProfile({
      email: user.email ?? "",
      emailVerified,
      company: profile?.company ?? (user.user_metadata as any)?.company ?? "",
      department: profile?.department ?? (user.user_metadata as any)?.department ?? "",
      name: profile?.name ?? (user.user_metadata as any)?.name ?? "",
    });
  };

  loadProfile();
}, [isLoggedIn]);

  // データ管理用State
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // setStateの対策
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // お気に入り
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isLoggedIn) {
        setFavoriteIds(new Set());
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('favorites')
        .select('post_id')
        .eq('user_id', user.id);
  
      if (!error) {
        setFavoriteIds(new Set((data || []).map(r => Number(r.post_id))));
      }
    };
  
    loadFavorites();
  }, [isLoggedIn]);

  const [favPending, setFavPending] = useState<Set<number>>(new Set());

  const toggleFavorite = async (postId: number) => {
    if (!isLoggedIn) {
      setShowGateModal(true);
      return;
    }
  
    // 連打防止（同じpostIdを処理中なら無視）
    if (favPending.has(postId)) return;
  
    const wasFav = favoriteIds.has(postId);
  
    // ① 先にUIを即反映（体感速度の肝）
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasFav) next.delete(postId);
      else next.add(postId);
      return next;
    });
  
    setFavPending(prev => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  
    try {
      // ② DB更新（遅くてもOK）
      if (wasFav) {
        const { error } = await supabase.rpc('remove_favorite', { p_post_id: postId });
        if (error) throw error;
        return;
      }
  
      const { error } = await supabase.rpc('add_favorite', { p_post_id: postId });
      if (error) {
        // 上限エラーは “巻き戻し” が必要
        if (String(error.message).includes('FAVORITE_LIMIT_REACHED')) {
          // ③ 失敗なのでUI巻き戻し（追加前に戻す）
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
          });
          alert('お気に入りは最大10件までです。不要なものを外してから追加してください。');
          return;
        }
        throw error;
      }
    } catch (e) {
      console.error(e);
      // ④ 失敗したら元に戻す（トグル前の状態に）
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (wasFav) next.add(postId);
        else next.delete(postId);
        return next;
      });
      alert('お気に入り更新に失敗しました');
    } finally {
      setFavPending(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };  

    // ページネーション
    const PAGE_SIZE = 20;
    const [totalCount, setTotalCount] = useState(0);

    const goToPage = (p: number) => {
      const next = Math.min(Math.max(1, p), totalPages);
      setPage(next);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 任意：ページ切替時に上に戻す
    };

    const getPageItems = (current: number, total: number) => {
      // totalが少ないなら全部出す
      if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
  
      // 先頭付近（1〜5を出して最後に…と最終ページ）
      if (current <= 4) {
        return [1, 2, 3, 4, 5, '…', total];
      }
  
      // 末尾付近（最初に1と…、最後はtotal-4〜total）
      if (current >= total - 3) {
        return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
      }
  
      // 真ん中（1 … current-1 current current+1 … total）
      return [1, '…', current - 1, current, current + 1, '…', total];
    };  
  
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // カテゴリ検索用のState
    const [filterIndustry, setFilterIndustry] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterYear, setFilterYear] = useState(''); 
    const [filterMonth, setFilterMonth] = useState('');
    const [filterListing, setFilterListing] = useState('');

    // 実際にフィルタを適用するトリガー用
    const [appliedIndustry, setAppliedIndustry] = useState('');
    const [appliedCategory, setAppliedCategory] = useState('');
    const [appliedYear, setAppliedYear] = useState('');
    const [appliedMonth, setAppliedMonth] = useState('');
    const [appliedListing, setAppliedListing] = useState('');
  
    // 未ログイン時の制限モーダル
    const [showGateModal, setShowGateModal] = useState(false);

    // 初期ロード：Supabaseからデータ取得
    const fetchPosts = useCallback(async () => {
      setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (appliedIndustry) q = q.eq("industry", appliedIndustry);
    if (appliedCategory) q = q.eq("category_type", appliedCategory);
    if (appliedListing) q = q.eq("listing_status", appliedListing);

    if (appliedYear) q = q.eq("incident_year", Number(appliedYear));
    if (appliedMonth) q = q.eq("incident_month", appliedMonth);

    const { data, error, count } = await q.range(from, to);

    if (!isMountedRef.current) return;

    if (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setTotalCount(0);
    } else {
      setPosts(data || []);
      setTotalCount(count || 0);
    }
 
    setLoading(false);
  }, [
    page,
    PAGE_SIZE,
    appliedIndustry,
    appliedCategory,
    appliedYear,
    appliedMonth,
    appliedListing,
  ]);
  
  //初回＆条件変更で実行する useEffect
  useEffect(() => {
  fetchPosts();
  }, [fetchPosts]);
  
  //タブ復帰 / フォーカス復帰で再取得する useEffect
  useEffect(() => {
  const onFocus = () => fetchPosts();
  const onVisibility = () => {
    if (document.visibilityState === "visible") fetchPosts();
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
  };
  }, [fetchPosts]);

  // カテゴリ検索実行
  const handleCategorySearch = () => {
    setAppliedIndustry(filterIndustry);
    setAppliedCategory(filterCategory);
    setAppliedYear(filterYear);
    setAppliedMonth(filterMonth);
    setAppliedListing(filterListing);
    setPage(1);
  };

  // 未ログイン時の表示件数制限（5件まで）
  const displayLimit = 5;
  const displayData = isLoggedIn ? posts : posts.slice(0, displayLimit);
  const hiddenCount = Math.max(0, totalCount - displayLimit);

  // 詳細閲覧アクション
  const handleItemClick = (item: any) => {
    if (isLoggedIn) {
      setSelectedIncident(item);
    } else {
      setShowGateModal(true); // 制限モーダルを表示
    }
  };

  // 未ログイン時の企業名マスキング処理
  const getCompanyName = (item: any) => {
    if (isLoggedIn) return item.company;
    return `某${item.industry?.split('・')[0] || ''}企業`; // 例：某メーカー企業
  };

  const renderStars = (score: number) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Flame key={i} size={20} className={i < Math.floor(score) ? "fill-red-500 text-red-500" : "text-gray-300"} />
      ))}
      <span className="text-xl font-bold text-red-600 ml-2">{score?.toFixed(1)}</span>
    </div>
  );

  // --- アカウント設定画面 ---
  const AccountView = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileDraft, setProfileDraft] = useState({
      company: "",
      department: "",
      name: "",
    });
    const [profileSaving, setProfileSaving] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords({...passwords, [e.target.name]: e.target.value});
    };

    const submitPasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
        alert("新しいパスワードと確認用パスワードが一致しません。");
        return;
      }
      if (passwords.new.length < 8) {
        alert("パスワードは8文字以上で設定してください。");
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) {
        alert(`変更に失敗しました: ${error.message}`);
      } else {
        alert("パスワードを変更しました。");
        setShowPasswordModal(false);
        setPasswords({ new: '', confirm: '' });
      }
    };

    const submitAccountDelete = async () => {
  if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
    alert('確認のため "DELETE" と入力してください。');
    return;
  }

  setDeleteLoading(true);
  try {
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(json?.error ?? "アカウント削除に失敗しました");
      return;
    }

    // 成功 → ログアウト & 画面戻し
    alert("アカウントを削除しました。ご利用ありがとうございました。");
    await supabase.auth.signOut();
    onLogout(); // 既存のログアウト処理に合わせたいならこれだけでもOK
  } catch (e) {
    console.error(e);
    alert("通信エラーが発生しました");
  } finally {
    setDeleteLoading(false);
    setShowDeleteModal(false);
    setDeleteConfirm("");
  }
    };

  useEffect(() => {
  setProfileDraft({
    company: userProfile?.company ?? "",
    department: userProfile?.department ?? "",
    name: userProfile?.name ?? "",
  });
  }, [userProfile]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="flex items-center">
          <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-gray-500 hover:text-gray-800 transition font-medium">
            <ArrowLeft size={20} className="mr-2" /> ダッシュボードに戻る
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Settings className="mr-2" /> アカウント設定
          </h2>

          <section className="mb-10">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">基本情報</h3>
              <div className="flex justify-end gap-2 mb-4">
                {!isEditingProfile ? (
        <button
          type="button"
          onClick={() => setIsEditingProfile(true)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold hover:bg-gray-50"
          >
          編集
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              // 値を戻す
              setProfileDraft({
                company: userProfile?.company ?? "",
                department: userProfile?.department ?? "",
                name: userProfile?.name ?? "",
              });
              setIsEditingProfile(false);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold hover:bg-gray-50"
            disabled={profileSaving}
            >
            キャンセル
          </button>
          <button
            type="button"
            onClick={async () => {
              // 保存処理（次のステップで関数化してもOK）
              setProfileSaving(true);
              try {
                const { data: { user }, error: userErr } = await supabase.auth.getUser();
                if (userErr || !user) throw new Error("ユーザー情報を取得できませんでした");
                
                // profiles を upsert（なければ作る / あれば更新）
                  const { error: upsertErr } = await supabase
                    .from("profiles")
                    .upsert({
                      id: user.id,
                      company: profileDraft.company.trim(),
                      department: profileDraft.department.trim(),
                      name: profileDraft.name.trim(),
                    });
                
                if (upsertErr) throw upsertErr;
                // （任意）authのuser_metadataも揃えたいなら
                await supabase.auth.updateUser({
                  data: {
                    company: profileDraft.company.trim(),
                    department: profileDraft.department.trim(),
                    name: profileDraft.name.trim(),
                  },
                });
                
                // 画面の表示を即時更新（Dashboardのstateを更新できる）
                setUserProfile((prev: any) => ({
                  ...prev,
                  company: profileDraft.company.trim(),
                  department: profileDraft.department.trim(),
                  name: profileDraft.name.trim(),
                }));
                
                setIsEditingProfile(false);
                alert("基本情報を更新しました");
              } catch (e: any) {
                console.error(e);
                alert(e?.message ?? "更新に失敗しました");
              } finally {
                setProfileSaving(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-60"
            disabled={profileSaving}
            >
            {profileSaving ? "保存中..." : "保存"}
          </button>
        </>
      )}
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.company}
                    onChange={(e) => setProfileDraft((p) => ({ ...p, company: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="会社名"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800">
                      {userProfile?.company || "未設定"}
                    </div>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部署名</label>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.department}
                    onChange={(e) => setProfileDraft((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="部署名"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800">
                      {userProfile?.department || "未設定"}
                    </div>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">担当者氏名</label>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.name}
                    onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="氏名"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800">
                      {userProfile?.name || "未設定"}
                    </div>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 flex justify-between items-center">
                <span>{userProfile?.email || '未設定'}</span>
                {userProfile?.emailVerified ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">認証済</span>
                ) : (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">未認証</span>
                )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">セキュリティ・その他</h3>
            <div className="space-y-4">
              <button onClick={() => setShowPasswordModal(true)} className="w-full flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div className="flex items-center">
                  <Lock className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="font-bold text-gray-700">パスワード変更</div>
                    <div className="text-xs text-gray-500">定期的な変更を推奨します</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
              <button onClick={() => setShowDeleteModal(true)}
                className="w-full flex justify-between items-center p-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition text-left"
                >
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-3" size={20} />
                  <div>
                    <div className="font-bold text-red-700">アカウント削除</div>
                    <div className="text-xs text-red-600">削除すると復元できません</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-300" />
              </button>              
              <button onClick={onLogout} className="w-full flex justify-center items-center p-4 mt-8 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-bold">
                <LogOut className="mr-2" size={20} /> ログアウト
              </button>
            </div>
          </section>
        </div>

        {showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
        <h3 className="font-bold text-red-800">アカウント削除（最終確認）</h3>
        <button
          onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
          className="text-red-400 hover:text-red-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-sm text-gray-700 leading-relaxed">
          アカウントを削除すると、ログインできなくなり、保存データも削除されます。
          <div className="mt-2 text-xs text-gray-500">
            ※ 再作成は可能ですが、データの復元はできません。
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            確認のため <span className="text-red-600">DELETE</span> と入力してください
          </label>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="DELETE"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
            disabled={deleteLoading}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={submitAccountDelete}
            disabled={deleteLoading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-60"
          >
            {deleteLoading ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">パスワード変更</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={submitPasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">新しいパスワード</label>
                  <div className="relative">
                    <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="New Password (8文字以上)" required minLength={8} />
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">新しいパスワード（確認）</label>
                  <div className="relative">
                    <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Confirm New Password" required />
                    <CheckCircle className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">キャンセル</button>
                  <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm">変更を保存</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 会員限定ゲートモーダル
  const GateModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={() => setShowGateModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">詳細情報は会員限定です</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            企業名、炎上の詳細な経緯、損害額、再発防止策などの<br/>
            具体的なデータは、アカウント登録後に閲覧可能です。
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => { setShowGateModal(false); onShowAuth('register'); }}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg flex justify-center items-center"
            >
              無料でアカウント作成
              <ArrowRight className="ml-2" size={20} />
            </button>
            <p className="text-sm text-gray-500">
              すでにアカウントをお持ちの方は <button onClick={() => { setShowGateModal(false); onShowAuth('login'); }} className="text-red-600 font-bold hover:underline">ログイン</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 詳細モーダル
  const DetailModal = () => {
    
    // 類似事例データの取得（IDリストから検索）
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

    const item = selectedIncident;
    
    useEffect(() => {
      if (!item) return;
      let cancelled = false;
      
      const loadRelated = async () => {
        const relatedIds = (item.related_post_ids ?? [])
        .map((x: any) => Number(x))
        .filter((x: number) => Number.isFinite(x));
        
        if (!relatedIds.length) {
          setRelatedPosts([]);
          return;
        }
        
        const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('id', relatedIds)
        .eq('status', 'published');
        
        if (cancelled) return;
        if (error) {
          console.error(error);
          setRelatedPosts([]);
          return;
        }
        
        const map = new Map((data || []).map((x: any) => [x.id, x]));
        setRelatedPosts(relatedIds.map((id: number) => map.get(id)).filter(Boolean));
      };
      
      loadRelated();
      
      return () => {
        cancelled = true;
      };
    }, [item?.id]);

    if (!selectedIncident) return null;

    const categoryType = item.category_type;
    const listingStatus = item.listing_status;
    const badMove = item.bad_move;
    const relatedLinks = item.related_links || [];

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIncident(null)}>
        <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-900 text-white p-6 relative shrink-0">
          <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedIncident(null);
          }}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-gray-800/60 hover:bg-gray-800 text-gray-200 hover:text-white transition pointer-events-auto"
          aria-label="閉じる"
          >
            <X size={22} />
            </button>
            <div className="flex items-center gap-3 mb-2 opacity-80">
              <span className="bg-gray-700 text-xs px-2 py-1 rounded">{item.industry}</span>
              <span className="text-sm">{item.date} 発生</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
            <div className="flex gap-4">
              <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                <span className="text-xs text-gray-400 mr-2">影響度スコア</span>
                {renderStars(item.score)}
              </div>
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
                    <li key={i} className="flex items-start"><span className="text-red-500 mr-2 mt-1">•</span><span className="text-gray-800 font-medium">{text}</span></li>
                  ))}
                </ul>
              </section>
              {item.timeline && item.timeline.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center"><Clock size={16} className="mr-2" /> タイムライン(※目安)</h3>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="relative">
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-300"></div>
                      <div className="space-y-6 relative">{item.timeline.map((step: any, index: number) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="relative z-10 w-6 h-6 flex-shrink-0 bg-white border-2 border-red-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-red-500 rounded-full"></div></div>
                          <div className="flex-1 -mt-1">
                            <div className="flex items-baseline gap-2 mb-1"><span className="font-bold text-sm text-red-600">{step.day}</span><h4 className="font-bold text-gray-800 text-sm">{step.title}</h4></div>
                            <p className="text-sm text-gray-600 leading-snug whitespace-pre-wrap">{step.desc}</p>
                          </div>
                        </div>
                      ))}</div>
                    </div>
                  </div>
                </section>
              )}
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
                  <ul className="text-sm space-y-2">{relatedLinks.map((link: any, idx: number) => (
                    <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 hover:bg-gray-100 p-1.5 rounded transition"><ExternalLink size={14} className="text-gray-400 mt-0.5 group-hover:text-blue-500" /><div><span className="text-xs font-bold text-gray-500 block">{link.source}</span><span className="text-gray-800 group-hover:text-blue-600 group-hover:underline leading-snug">{link.title}</span></div></a></li>
                  ))}</ul>
                ) : <p className="text-xs text-gray-400">関連リンクはありません。</p>}
              </div>

              {/* 類似事例セクション */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2 text-sm flex items-center">
                  <LinkIcon size={14} className="mr-2" /> 同カテゴリ・同業種事例
                </h4>
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Flame className="text-red-500 fill-red-500" size={28} />
                <span className="text-xl font-bold tracking-tight">炎上.com</span>
              </div>
            </div>
            
            {/* ヘッダー右側 */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button onClick={onLogout} className="flex items-center gap-2 text-gray-300 hover:text-white transition text-sm font-bold">
                    <LogOut size={18} /> ログアウト
                  </button>

                  <Link
                  href="/favorites"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    <Star size={18} className="text-yellow-300" />
                    お気に入り
                    </Link>

                  {/* アイコンをbutton化してクリックで設定へ */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="h-9 w-9 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600 hover:bg-gray-600 transition"
                    aria-label="アカウント設定"
                  >
                    <User size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => onShowAuth('login')} className="text-gray-300 hover:text-white font-bold text-sm">ログイン</button>
                  <button onClick={() => onShowAuth('register')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">無料登録</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 flex-1">
        {activeTab === 'account' ? (
          <AccountView />
        ) : (
          <>
            {/* 未ログイン時のCTAバナー */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-2xl font-bold mb-2">事例から学ぶ、最強のリスクマネジメント。</h1>
                  <p className="text-gray-300">過去の炎上・拡散事例をデータベース化。自社のリスクを事前に予習・対策。</p>
                </div>
                <button onClick={() => onShowAuth('register')} className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg flex items-center whitespace-nowrap">
                  会員登録して閲覧する <ArrowRight className="ml-2" />
                </button>
              </div>
            )}

            {/* ====== ここから：左サイドバー + 右一覧の2カラム ====== */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* 左：サイドバー（絞り込み + 影響度） */}
  <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
    {/* 絞り込み */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 見出し */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Filter size={16} /> カテゴリ絞り込み
        </div>
      </div>

      <div className="p-4 sm:p-6 relative">
        {!isLoggedIn && (
          <div
            className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center cursor-pointer backdrop-blur-[1px]"
            onClick={() => setShowGateModal(true)}
          />
        )}

        {/* PCでは左寄せの縦並び（上段:年/月 → 中段:業界/カテゴリ/上場区分 → 下段:検索） */}
        <div className="space-y-4">
          {/* 上段：年 / 月 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {/* 年代 */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">年代</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                  <Calendar size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none cursor-pointer text-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">すべて</option>
                  {["2026","2025","2024","2023","2022","2021","2020","2019"].map((year) => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>

            {/* 月 */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">月</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                  <Calendar size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none cursor-pointer text-sm"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="">すべて</option>
                  {Array.from({ length: 12 }, (_, i) => {
                  const mm = String(i + 1).padStart(2, "0"); // value用：01〜12
                  const label = i + 1;                        // 表示用：1〜12
                  return (
                    <option key={mm} value={mm}>{label}月
                    </option>
                  );
                })}
                </select>
                <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* 中段：業界 / カテゴリ / 上場区分（PCは縦に3つ、SPはそのまま） */}
          <div className="space-y-3">
            {/* 業界 */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">業界</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                  <Filter size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none cursor-pointer text-sm"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="">すべての業界</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>

            {/* カテゴリ */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">カテゴリ</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                  <AlertTriangle size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none cursor-pointer text-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">すべてのカテゴリ</option>
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>

            {/* 上場区分 */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">上場区分</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                  <Building size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none cursor-pointer text-sm"
                  value={filterListing}
                  onChange={(e) => setFilterListing(e.target.value)}
                >
                  <option value="">すべて</option>
                  {LISTING_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* 下段：検索ボタン */}
          <button
            onClick={handleCategorySearch}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-700 transition shadow-sm w-full"
            disabled={!isLoggedIn}
          >
            検索
          </button>
        </div>
      </div>
    </div>

    {/* 影響度スコア（PCは1カラムで縦積み） */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <h3 className="font-bold text-gray-800 flex items-center">
          <Info size={18} className="mr-2 text-gray-500" />
          影響度スコアの目安
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(SCORE_DEFINITIONS).map(([score, def]) => (
          <div
            key={score}
            className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-start gap-3"
          >
            <div className="shrink-0 flex items-center gap-1">
              <Flame
                size={16}
                className={`fill-red-500 ${Number(score) >= 4 ? "text-red-600" : "text-red-500"}`}
              />
              <span className="font-bold text-lg text-gray-900">{score}</span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-500 inline-flex items-center bg-white px-2 py-0.5 rounded border border-gray-200">
                {def.label}
              </div>
              <p className="text-xs text-gray-600 leading-snug mt-1">
                {def.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </aside>

  {/* 右：事例一覧（カード群 + ページネーション） */}
<section className="lg:col-span-8 xl:col-span-9">
  <div className="relative">
    {loading ? (
      <div className="text-center py-20 text-gray-500">データを読み込み中...</div>
    ) : displayData.length === 0 ? (
      <div className="py-20">
        <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-4">
            <Filter size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            該当する事例が見つかりません
          </h3>
          <p className="text-gray-500 text-sm">
            検索条件を変更してお試しください
          </p>
        </div>
      </div>
    ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayData.map((item) => {
            const categoryType = item.category_type;
            const categoryObj = CATEGORIES[categoryType as keyof typeof CATEGORIES];

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition cursor-pointer relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    categoryType === "CREATIVE"
                    ? "bg-purple-500"
                    : categoryType === "SERVICE"
                    ? "bg-orange-500"
                    : categoryType === "GOVERNANCE"
                    ? "bg-gray-500"
                    : "bg-blue-500" // COMMUNICATION
                  }`}
                />

                <div className="flex justify-between items-start pl-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryObj?.color}`}>
                        {categoryObj?.label}
                      </span>
                      <span className="text-xs text-gray-400">{item.date} 発生</span>
                      <span className="text-xs text-gray-400">| {item.industry}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition">
                      {isLoggedIn ? item.title : `【${categoryObj?.label}】${getCompanyName(item)}で発生した炎上事例`}
                    </h3>

                    <div className="flex gap-2 mt-2">
                      {isLoggedIn ? (
                        item.tags?.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="text-xs bg-gray-100 text-transparent px-2 py-1 rounded blur-sm select-none">
                            #SampleTag
                          </span>
                          <span className="text-xs bg-gray-100 text-transparent px-2 py-1 rounded blur-sm select-none">
                            #HiddenTag
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[100px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="mb-2 p-2 rounded hover:bg-gray-100"
                      aria-label="お気に入り"
                    >
                      <Star
                        size={20}
                        className={
                          favoriteIds.has(item.id)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    </button>

                    <div className="text-xs text-gray-400 mb-1">影響度スコア</div>
                    <div className="flex items-center space-x-1">
                      <Flame size={16} className={item.score >= 4.0 ? "text-red-600 fill-red-600" : "text-red-500"} />
                      <span className={`text-2xl font-bold ${item.score >= 4.0 ? "text-red-600" : "text-gray-800"}`}>
                        {item.score?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ページネーション（今のまま貼り替え） */}
      {isLoggedIn && totalCount > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="text-sm text-gray-500">
            {totalCount}件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, totalCount)}件を表示（{page} / {totalPages}ページ）
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold disabled:opacity-40 hover:bg-gray-50"
            >
              前へ
            </button>

            <div className="flex items-center gap-1">
              {getPageItems(page, totalPages).map((it, idx) => {
                if (it === "…") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
                      …
                    </span>
                  );
                }
                const p = it as number;
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-lg text-sm font-bold border transition ${
                      p === page ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold disabled:opacity-40 hover:bg-gray-50"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* 未ログイン時の残り表示 */}
      {!isLoggedIn && hiddenCount > 0 && (
        <div className="mt-6 text-center">
          <div className="p-8 bg-gray-100 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600 font-bold mb-4 text-lg">残りの事例を確認するには</p>
            <button
              onClick={() => onShowAuth("register")}
              className="bg-red-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition shadow-xl flex items-center mx-auto"
            >
              <Lock size={18} className="mr-2" />
              会員登録して全て見る
            </button>
          </div>
        </div>
　　　　)}
    </div>
  </section>
</div>
</>
　)} 
{selectedIncident && <DetailModal />}
</main>
      {showGateModal && <GateModal />}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-red-500 fill-red-500" size={24} />
                <span className="text-xl font-bold tracking-tight">炎上.com</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                失敗から学ぶ、リスクマネジメント。<br/>
                企業のリスク対策を支援するデータベースサービス。
              </p>
              <p className="text-gray-500 text-xs">© 2026 Flock Inc. All rights reserved.</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-gray-300 text-sm">サービス</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition">事例検索</button></li>
                {!isLoggedIn && (
                  <>
                    <li><button onClick={() => onShowAuth('register', 'footer')} className="hover:text-white transition">会員登録</button></li>
                    <li><button onClick={() => onShowAuth('login', 'footer')} className="hover:text-white transition">ログイン</button></li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-300 text-sm">規約・お問い合わせ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">プライバシーポリシー</Link></li>
                <li className="pt-2">
                  <a href="mailto:info@flock-inc.com" className="flex items-center gap-2 hover:text-white text-gray-300 transition">
                    <Mail size={14} /> info@flock-inc.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  onBackToDashboard,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer: React.ReactNode;
  onBackToDashboard: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <div className="hidden lg:flex w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#FF0000"
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-0.9,75.1C-14.4,76.6,-29.1,74.5,-42.6,67.8C-56.1,61.1,-68.4,49.9,-76.7,36.2C-85,22.5,-89.3,6.3,-86.7,-8.7C-84.1,-23.7,-74.6,-37.5,-63.1,-48.3C-51.6,-59.1,-38.1,-66.9,-24.6,-74.6C-11.1,-82.3,2.4,-89.9,15.6,-89.5C28.8,-89.1,41.7,-80.7,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <div
            className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition inline-block"
            onClick={onBackToDashboard}
          >
            <Flame className="text-red-500 fill-red-500" size={32} />
            <span className="text-2xl font-bold tracking-tight">炎上.com</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            失敗から学ぶ、
            <br />
            リスクマネジメント。
          </h1>

          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center gap-3">
              <CheckCircle className="text-red-500" size={20} />
              <span>炎上/リスク事例のデータベース</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-red-500" size={20} />
              <span>業界別・カテゴリ別の詳細なリスク分析</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-red-500" size={20} />
              <span>炎上時のタイムライン、損害、記事まとめの実例を公開</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          <p>© 2026 Flock Inc. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              onClick={onBackToDashboard}
            >
              <Flame className="text-red-500 fill-red-500" size={32} />
              <span className="text-2xl font-bold tracking-tight">炎上.com</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">{children}</div>

          {footer}
        </div>
      </div>
    </div>
  );
}

function DocumentLayout({
  title,
  isFooterMode,
  onBack,
  onAgreeBackToRegister,
  children,
}: {
  title: string;
  isFooterMode: boolean;
  onBack: () => void;
  onAgreeBackToRegister: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <div className="bg-white border-b px-6 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
          {isFooterMode ? <X size={20} /> : <ArrowLeft size={20} />}
        </button>
        <span className="font-bold text-lg">{title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">{children}</div>

          {!isFooterMode && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={onAgreeBackToRegister}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg"
              >
                同意して登録画面に戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. 認証画面コンポーネント (AuthScreens) 
// ==========================================
const AuthScreens = ({
  initialView = "login",
  authSource = "register-flow",
  onLogin,
  onBackToDashboard,
}: {
  initialView: string;
  authSource: string;
  onLogin: () => void;
  onBackToDashboard: () => void;
}) => {
  const [view, setView] = useState(initialView);

  // 登録フォームの状態
  const [registerStep, setRegisterStep] = useState(1);
  const [registerFormData, setRegisterFormData] = useState({
    email: "",
    password: "",
    company: "",
    department: "",
    name: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFooterMode = authSource === "footer";

  // ログイン画面で「このメールは登録済み？」を判定するための状態
  const [emailCheckStatus, setEmailCheckStatus] = useState<
  "idle" | "checking" | "exists" | "not_exists"
  >("idle");

  useEffect(() => {
    // ① login画面の時だけ判定したい
    if (view !== "login") {
      setEmailCheckStatus("idle");
      return;
    }
  
    // ② 入力されてるメールを取得（空白削除 + 小文字）
    const email = registerFormData.email.trim().toLowerCase();
  
    // ③ まだ入力が弱い（空 / @なし）なら判定しない
    if (!email || !email.includes("@")) {
      setEmailCheckStatus("idle");
      return;
    }
  
    // ④ 入力中に毎回APIを叩かないため、0.5秒待ってから実行（デバウンス）
    const timer = setTimeout(async () => {
      setEmailCheckStatus("checking");
  
      try {
        const res = await fetch("/api/auth/email-exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        const json = await res.json();
        setEmailCheckStatus(json.exists ? "exists" : "not_exists");
      } catch {
        // ⑤ エラー時は「判定できない」扱いに戻す
        setEmailCheckStatus("idle");
      }
    }, 500);
  
    // ⑥ 入力が変わったら、前のタイマーはキャンセル
    return () => clearTimeout(timer);
  }, [view, registerFormData.email]);  

  // --- Supabase認証 ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: registerFormData.email,
      password: registerFormData.password,
    });

    if (error) {
      alert(`ログイン失敗: ${error.message}`);
    } else {
      onLogin();
    }
  };

  // --- パスワード再設定用 ---
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error: authError } = await supabase.auth.signUp({
      email: registerFormData.email,
      password: registerFormData.password,
      options: {
        data: {
          company: registerFormData.company,
          department: registerFormData.department,
          name: registerFormData.name,
        },
      },
    });

    if (authError) {
      alert(`登録失敗: ${authError.message}`);
      return;
    }
    setView("register-success");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validateEmail = (email: string) => {
      if (!email.includes("@")) return false;
      return !FREE_EMAIL_DOMAINS.includes(email.split("@")[1]);
    };
    const validatePass = (pwd: string) => pwd.length >= 8;

    if (!validateEmail(registerFormData.email)) {
      setEmailError("フリーメールは不可です");
      alert("フリーメールは利用できません");
      return;
    }
    if (!validatePass(registerFormData.password)) {
      setPasswordError("8文字以上で設定してください");
      alert("パスワードは8文字以上で設定してください");
      return;
    }
    setEmailError("");
    setPasswordError("");
    setRegisterStep(2);
  };

  const handleDocBack = () => {
    if (isFooterMode) {
      onBackToDashboard();
    } else {
      setView("register");
    }
  };

  // --- 規約 ---
  if (view === "terms") {
    return (
      <DocumentLayout
        title="利用規約"
        isFooterMode={isFooterMode}
        onBack={handleDocBack}
        onAgreeBackToRegister={() => setView("register")}
      >
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-2">第1条（目的・定義）</h3>
          <p>
            本規約は、Flock Inc.（以下「当社」）が提供する炎上事例データベース「炎上.com」の利用条件を定めるものです。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第2条（情報の性質と免責）</h3>
          <p>本サービスで提供される情報は、過去の公知の事実および当社独自の分析に基づくものです。</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第3条（禁止事項）</h3>
          <p>
            会員は、本サービスで得た情報を自社の内部利用（社内教育、リスク管理）に限定し、第三者への開示・転送・販売・出版を行ってはなりません。
          </p>
          <p>スクレイピング等による自動的なデータ収集は固く禁じます。</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第4条（反社会的勢力の排除）</h3>
          <p>
            会員は、自らが反社会的勢力でないこと、および反社会的勢力と関わりを持たないことを表明し、保証するものとします。
          </p>
        </>
      </DocumentLayout>
    );
  }

  // --- プライバシー ---
  if (view === "privacy") {
    return (
      <DocumentLayout
        title="プライバシーポリシー"
        isFooterMode={isFooterMode}
        onBack={handleDocBack}
        onAgreeBackToRegister={() => setView("register")}
      >
        <>
          <p>Flock Inc.は、本サービスの利用における個人情報の取り扱いについて以下の通り定めます。</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第1条（個人情報）</h3>
          <p>
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報（個人識別情報）を指します。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第2条（個人情報の収集方法）</h3>
          <p>当社は、ユーザーが利用登録をする際に氏名、会社名、部署名、メールアドレスなどの個人情報をお尋ねすることがあります。</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第3条（個人情報の利用目的）</h3>
          <p>当社が個人情報を収集・利用する目的は、以下のとおりです。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>本サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</li>
            <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
            <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">第4条（利用目的の変更）</h3>
          <p>当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</p>
        </>
      </DocumentLayout>
    );
  }

  // --- パスワード再設定 ---
// --- パスワード再設定 ---
if (view === "forgot-password") {
  return (
    <AuthLayout
      title="パスワードの再設定"
      subtitle="ご登録のメールアドレスを入力してください。"
      onBackToDashboard={onBackToDashboard}
      footer={
        <div className="text-center">
          <button
            onClick={() => setView("login")}
            className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={16} className="mr-1" /> ログイン画面に戻る
          </button>
        </div>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setResetLoading(true);

          try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
              redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;

            alert("再設定メールを送信しました（迷惑メールもご確認ください）");
            setResetEmail("");
            setView("login");
          } catch (err: any) {
            alert(err?.message ?? "送信に失敗しました。時間をおいて再度お試しください。");
          } finally {
            setResetLoading(false);
          }
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
          <div className="relative">
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            />
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        <button
          type="submit"
          disabled={resetLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center disabled:opacity-60"
        >
          {resetLoading ? "送信中..." : "再設定リンクを送信"} <Send className="ml-2" size={18} />
        </button>
      </form>
    </AuthLayout>
  );
}

  // --- 登録成功 ---
  if (view === "register-success") {
    return (
      <AuthLayout
        title="登録を受け付けました"
        onBackToDashboard={onBackToDashboard}
        footer={
          <p className="text-center text-sm text-gray-600">
            <button onClick={() => setView("login")} className="font-bold text-red-600 hover:text-red-500 transition">
              トップページへ戻る
            </button>
          </p>
        }
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-800">ご登録ありがとうございます</h3>
            <p className="text-gray-600 text-sm leading-relaxed">メールをご確認いただき、認証を完了させてください。</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // --- ログイン ---
  if (view === "login") {
    return (
      <AuthLayout
        title="おかえりなさい"
        subtitle="アカウントにログインしてデータベースを利用"
        onBackToDashboard={onBackToDashboard}
        footer={
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでないですか？{" "}
            <button onClick={() => setView("register")} className="font-bold text-red-600 hover:text-red-500 transition">
              アカウント作成
            </button>
          </p>
        }
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
            <div className="relative">
              <input
                type="email"
                required
                value={registerFormData.email}
                onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
            {emailCheckStatus === "checking" && (
              <p className="text-xs text-gray-500 mt-1">確認中...</p>
              )}
              {emailCheckStatus === "exists" && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  すでに登録済みのメールアドレスです
                  </p>
                )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">パスワード</label>
              <button type="button" onClick={() => setView("forgot-password")} className="text-xs text-red-600 hover:underline">
                パスワードをお忘れですか？
              </button>
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={registerFormData.password}
                onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center group"
          >
            ログイン <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={18} />
          </button>
        </form>
      </AuthLayout>
    );
  }

  // --- 登録（Step 1 / Step 2） ---
  return (
    <AuthLayout
      title="新規アカウント作成"
      subtitle="30秒で登録完了。まずは無料でお試しください。"
      onBackToDashboard={onBackToDashboard}
      footer={
        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <button onClick={() => setView("login")} className="font-bold text-red-600 hover:text-red-500 transition">
            ログイン
          </button>
        </p>
      }
    >
      <div className="flex items-center gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full ${registerStep >= 1 ? "bg-red-500" : "bg-gray-200"}`}></div>
        <div className={`h-1.5 flex-1 rounded-full ${registerStep >= 2 ? "bg-red-500" : "bg-gray-200"}`}></div>
      </div>

      <form onSubmit={registerStep === 1 ? handleRegisterSubmit : handleRegisterComplete} className="space-y-6">
        {registerStep === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                    emailError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-red-500"
                  }`}
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              {emailError && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {emailError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">※ フリーメール（Gmail等）不可</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">パスワード設定</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={registerFormData.password}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                    passwordError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-red-500"
                  }`}
                  placeholder="8文字以上"
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!registerFormData.email || !registerFormData.password}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
            >
              次へ進む
            </button>
          </div>
        )}

        {registerStep === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">会社名</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={registerFormData.company}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">部署名</label>
                <input
                  type="text"
                  required
                  value={registerFormData.department}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">氏名</label>
                <input
                  type="text"
                  required
                  value={registerFormData.name}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="mt-1 accent-red-600 w-4 h-4" />
                <span className="text-xs text-gray-600">
                  <button type="button" onClick={() => setView("terms")} className="underline hover:text-gray-900">
                    利用規約
                  </button>{" "}
                  および{" "}
                  <button type="button" onClick={() => setView("privacy")} className="underline hover:text-gray-900">
                    プライバシーポリシー
                  </button>{" "}
                  に同意し、反社会的勢力ではないことを誓約します。
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="px-4 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
              >
                戻る
              </button>
              <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg">
                登録する
              </button>
            </div>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

// ==========================================
// 3. メインアプリコンポーネント (統合)
// ==========================================
export default function App() {
  const [viewState, setViewState] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authSource, setAuthSource] = useState('register-flow');

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsLoggedIn(!!session);
      setAuthReady(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsLoggedIn(!!session);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleShowAuth = (mode = 'login', source = 'register-flow') => {
    setAuthMode(mode);
    setAuthSource(source); 
    setViewState('auth');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setViewState('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setViewState('dashboard');
  };

  const handleBackToDashboard = () => {
    setViewState('dashboard');
  };

  if (viewState === 'auth' && !isLoggedIn) {
    return <AuthScreens initialView={authMode} authSource={authSource} onLogin={handleLoginSuccess} onBackToDashboard={handleBackToDashboard} />;
  }
    if (!authReady) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          読み込み中...
        </div>
      );
    }  

  return (
    <Dashboard 
      isLoggedIn={isLoggedIn} 
      onShowAuth={handleShowAuth} 
      onLogout={handleLogout} 
    />
  );
}
