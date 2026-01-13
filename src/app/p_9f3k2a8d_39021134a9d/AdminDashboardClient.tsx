"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, Plus, Search, 
  Edit, Trash2, Save, X, ChevronLeft, ChevronDown, Check, AlertCircle,
  Flame, Clock, MoreHorizontal, Info, UserPlus, Shield, Activity, Lock,
  Building2, Filter, EyeOff, Link, ExternalLink, Newspaper
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

// --- データ定義 ---
type CategoryKey = 'CREATIVE' | 'SERVICE' | 'GOVERNANCE' | 'COMMUNICATION';
type CategoryValue = { label: string; color: string };

const CATEGORIES: Record<CategoryKey, CategoryValue> = {
  CREATIVE: { label: 'クリエイティブ表現', color: 'bg-purple-100 text-purple-800' },
  SERVICE: { label: '商品・サービス・接客', color: 'bg-orange-100 text-orange-800' },
  GOVERNANCE: { label: '企業コンプライアンス', color: 'bg-gray-100 text-gray-800' },
  COMMUNICATION: { label: 'SNSコミュニケーション', color: 'bg-blue-100 text-blue-800' },
};

type PostStatus = 'draft' | 'private' | 'published';

type RelatedLink = { source: string; title: string; url: string };
type TimelineItem = { day: string; title: string; desc: string };

type Post = {
  id: number;
  title?: string;
  company?: string;
  status?: PostStatus;
  score?: number;
  category_type?: CategoryKey;
  related_post_ids?: number[];
  related_links?: RelatedLink[];
  timeline?: TimelineItem[];
  created_at?: string;
  updated_at?: string;
};

const INDUSTRIES: string[] = ["水産・農林業", "鉱業", "建設業", "製造業", "電気・ガス業", "運輸・情報通信業", "商業", "金融・保険業", "不動産業", "サービス業", "非営利"];
const LISTING_STATUSES: string[] = ["未上場", "東証プライム", "東証スタンダード", "東証グロース", "海外上場", "その他"];
const MEDIA_SOURCES: string[] = ["Yahoo!ニュース", "X (旧Twitter)", "SmartNews", "LINE NEWS", "TBS NEWS DIG", "東洋経済", "産経ニュース", "読売新聞オンライン", "毎日新聞", "東洋経済オンライン", "ダイヤモンド・オンライン", "ORICON NEWS", "日経ビジネス", "ITmedia", "ハフポスト", "PR TIMES", "Togetter", "YouTube", "テレビ報道", "その他"];

const SCORE_DEFINITIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "限定的", desc: "一部界隈で批判・引用RTで拡散" },
  2: { label: "軽微", desc: "SNS上で一定拡散、検索上位に一時浮上" },
  3: { label: "中程度", desc: "複数プラットフォームに波及、まとめ・ニュース化、トレンドイン" },
  4: { label: "重大", desc: "ニュース・大手メディア・行政/業界団体が反応、TVCM取りやめ" },
  5: { label: "致命的", desc: "役員辞任・株価下落・行政指導・不買運動" },
};

const ADMIN_ROLES: Record<string, { label: string; desc: string }> = {
  ADMIN: { label: '管理者', desc: '事例・顧客管理' },
  POSTER: { label: '投稿者', desc: '事例編集のみ' },
};

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [viewMode, setViewMode] = useState('list'); 
  
  // データのState
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<any[]>([]); // 顧客データ
  const [admins, setAdmins] = useState<any[]>([]); // 管理者データ
  const [dashboardStats, setDashboardStats] = useState<{ totalUsers: number; uniqueCompanies: number }>({
    totalUsers: 0,
    uniqueCompanies: 0,
  });
  const [loading, setLoading] = useState(true);

  // ページネーション
  const POSTS_PAGE_SIZE = 100;   // 事例管理：1ページ100件
  const USERS_PAGE_SIZE = 50;   // 顧客管理：1ページ50件
  
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalCount, setPostsTotalCount] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);

  // 発生時期フィルタ
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // 編集用State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null); 
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);

  // 権限State
  type Role = 'ADMIN' | 'POSTER';
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isAdmin = myRole === 'ADMIN';
  const can = {
    dashboard: isAdmin || myRole === 'POSTER',
    posts: isAdmin || myRole === 'POSTER',
    users: isAdmin,
    settings: isAdmin,
  };
  const getPageItems = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  
    return [1, '…', current - 1, current, current + 1, '…', total];
  };
  
  const Pagination = ({
    page,
    totalCount,
    pageSize,
    onChange,
  }: {
    page: number;
    totalCount: number;
    pageSize: number;
    onChange: (p: number) => void;
  }) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const items = getPageItems(page, totalPages);
    
    if (authLoading) return null;
    if (!myRole) return null;
  
    return (
      <div className="flex items-center justify-between gap-3 mt-4">
        <div className="text-xs text-gray-500">
          全 {totalCount} 件（{page}/{totalPages} ページ）
        </div>
  
        <div className="flex items-center gap-1">
          <button
            className="h-9 px-3 rounded-lg border text-sm font-bold disabled:opacity-40"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            前へ
          </button>
  
          {items.map((it, idx) => {
            if (it === '…') {
              return (
                <span key={`e-${idx}`} className="px-2 text-gray-400 select-none">
                  …
                </span>
              );
            }
            const p = it as number;
            return (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`h-9 w-9 rounded-lg text-sm font-bold border transition
                  ${p === page ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            );
          })}
  
          <button
            className="h-9 px-3 rounded-lg border text-sm font-bold disabled:opacity-40"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            次へ
          </button>
        </div>
      </div>
    );
  };  

  // --- 初期ロード ---
  useEffect(() => {
    (async () => {
      setAuthLoading(true);
  
      const { data: { user } } = await supabase.auth.getUser();
  
      // ✅ 未ログインなら 404
      if (!user) {
        setAuthLoading(false);
        notFound();
        return;
      }
  
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('user_id', user.id)
        .single();
  
      // ✅ admins にいない or role 無し or エラーでも 404
      if (error || !data?.role) {
        setAuthLoading(false);
        notFound();
        return;
      }
  
      const role = data.role as Role;
  
      // ✅ 念のため role が想定外でも 404
      if (!['ADMIN', 'POSTER'].includes(role)) {
        setAuthLoading(false);
        notFound();
        return;
      }
  
      setMyRole(role);
  
      // roleが確定してから必要なデータだけ取る
      await fetchAllData(role);
  
      setAuthLoading(false);
    })();
  }, []);
  
  useEffect(() => {
    if (authLoading) return;
    if (!myRole) return;
    fetchPosts();
  }, [authLoading, myRole, activeMenu]);

  const fetchAllData = async (role: Role) => {
  setLoading(true);

  // まず posts は必ず取る
  const tasks: Promise<any>[] = [fetchPosts(), fetchDashboardStats()];

  // 管理者だけ users/admins を取る
  if (role === 'ADMIN') {
    tasks.push(fetchUsers());
    tasks.push(fetchAdmins());
  }

  await Promise.all(tasks);
  setLoading(false);
};

  // フィルター条件
  useEffect(() => {
  if (activeMenu !== 'posts') return;
  setPostsPage(1);
}, [filterYear, filterMonth, activeMenu]);
  
  // 事例管理：ページ変更で再取得
  useEffect(() => {
    if (authLoading) return;
    if (!myRole) return;
    if (activeMenu !== 'posts') return;
    fetchPosts(postsPage, filterYear, filterMonth);
  }, [authLoading, myRole, activeMenu, postsPage, filterYear, filterMonth]);

　// 顧客管理：ページ変更で再取得（管理者のみ）
  useEffect(() => {
  if (authLoading) return;
  if (myRole !== 'ADMIN') return;
  if (activeMenu !== 'users') return;
  fetchUsers(usersPage);
}, [authLoading, myRole, activeMenu, usersPage]);

  const fetchPosts = async (
  page = postsPage,
  y = filterYear,
  m = filterMonth
) => {
  const from = (page - 1) * POSTS_PAGE_SIZE;
  const to = from + POSTS_PAGE_SIZE - 1;

  let q = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // 発生時期で絞り込み（両方選ばれてる時だけ）
  if (y !== 'all' && m !== 'all') {
    q = q.eq('date', `${y}年${m}月`);
  }

  const { data, error, count } = await q.range(from, to);

  if (error) {
    console.error(error);
    setPosts([]);
    setPostsTotalCount(0);
    return;
  }

  setPosts((data as Post[]) || []);
  setPostsTotalCount(count || 0);
};

  const fetchUsers = async (page = usersPage) => {
    const from = (page - 1) * USERS_PAGE_SIZE;
    const to = from + USERS_PAGE_SIZE - 1;
  
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, company, department, name, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
  
    if (error) {
      console.error(error);
      setUsers([]);
      setUsersTotalCount(0);
      return;
    }
  
    setUsers(data || []);
    setUsersTotalCount(count || 0);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
    setAdmins(data || []);
  };
  const fetchDashboardStats = async () => {
    // 累計ユーザー数（件数だけ）
    const { count: totalUsers, error: totalErr } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
  
    // 導入企業数（ユニーク） ※簡易版：company列だけ取得して Set でユニーク化
    const { data: companies, error: compErr } = await supabase
      .from('profiles')
      .select('company');
  
    const uniqueCompanies = new Set(
      (companies || []).map((r: any) => r.company).filter((v: any) => !!v)
    ).size;
  
    if (totalErr || compErr) {
      setDashboardStats({ totalUsers: 0, uniqueCompanies: 0 });
      return;
    }
  
    setDashboardStats({
      totalUsers: totalUsers ?? 0,
      uniqueCompanies,
    });
  };
  

  // --- 事例管理ロジック ---
  const years: number[] = Array.from({ length: 10 }, (_, i) => 2019 + i);
  const months: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  const initFormData = () => ({
    title: '', company: '', industry: '水産・農林業', listing_status: '未上場',
    dateYear: '2024', dateMonth: '01', 
    category_type: 'CREATIVE', tags: '', score: 3.0, 
    summary: '', impact: '', bad_move: '', lesson: '', status: 'draft',
    related_post_ids: [], related_links: [{ source: 'Yahoo!ニュース', title: '', url: '' }],
    timeline: [{ day: 'Day 0', title: '発生', desc: '' }]
  });

  const handleCreateNew = () => {
    setFormData(initFormData());
    setEditingPost(null);
    setViewMode('edit');
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    const dateStr = post.date || '2024年01月';
    const year = dateStr.replace(/年.*/, '') || '2024';
    const month = dateStr.replace(/.*年/, '').replace(/月/, '') || '01';
    
    setFormData({
      ...initFormData(),
      ...post,
      dateYear: year, dateMonth: month,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      impact: Array.isArray(post.impact) ? post.impact.join('\n') : (post.impact || ''),
      related_links: post.related_links || [{ source: 'Yahoo!ニュース', title: '', url: '' }],
      timeline: post.timeline || [{ day: 'Day 0', title: '発生', desc: '' }],
      related_post_ids: post.related_post_ids || [],
    });
    setViewMode('edit');
  };

　const handleSavePost = async () => {
  if (!formData?.title?.trim()) {
    alert("タイトルは必須です");
    return;
  }

  const saveData = {
    title: formData.title.trim(),
    company: (formData.company || "").trim(),
    industry: formData.industry,
    listing_status: formData.listing_status,
    date: `${formData.dateYear}年${formData.dateMonth}月`,
    category_type: formData.category_type,
    tags:
      typeof formData.tags === "string"
        ? formData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : formData.tags,
    score: Number.parseFloat(String(formData.score)),
    status: formData.status,
    summary: (formData.summary || "").trim(),
    impact:
      typeof formData.impact === "string"
        ? formData.impact.split("\n").map((t: string) => t.trim()).filter(Boolean)
        : formData.impact,
    bad_move: (formData.bad_move || "").trim(),
    lesson: (formData.lesson || "").trim(),
    related_links: formData.related_links || [],
    timeline: formData.timeline || [],
    related_post_ids: formData.related_post_ids || [],
    updated_at: new Date().toISOString(),
  };

  try {
    if (editingPost?.id) {
      // 更新処理
      const { data, error } = await supabase
        .from("posts")
        .update(saveData)
        .eq("id", editingPost.id)
        .select("*")
        .single();

      if (error) throw error;

      // 即座にローカルstateを更新
      setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setEditingPost(data);
      
      alert("保存しました");
      setViewMode("list");

      // 現在のフィルタ条件で再取得（ページ位置維持）
      await fetchPosts(postsPage, filterYear, filterMonth);
      
    } else {
      // 新規作成処理
      const { data, error } = await supabase
        .from("posts")
        .insert(saveData)
        .select("*")
        .single();

      if (error) throw error;

      alert("保存しました");
      setViewMode("list");

      // 現在のフィルタ条件で再取得（ページ位置維持）
      await fetchPosts(postsPage, filterYear, filterMonth);
    }

  } catch (e: any) {
    console.error(e);
    alert(`保存に失敗しました: ${e?.message ?? "不明なエラー"}`);
  }
};

  // 事例削除ハンドラ
const handleDeletePost = async (postId: number) => {
  if (!window.confirm('この事例を削除しますか？この操作は取り消せません。')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    // 即座にローカルstateから削除
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setPostsTotalCount((c) => c - 1);

    alert('削除しました');

    // 最新データを取得
    await fetchPosts(postsPage, filterYear, filterMonth);
  } catch (e: any) {
    console.error(e);
    alert(`削除に失敗しました: ${e?.message ?? '不明なエラー'}`);
  }
};

  // フォーム入力ハンドラ類
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  const toggleRelatedPost = (postId: number) => {
    setFormData((prev: any) => {
      const currentIds = prev.related_post_ids || [];
      return { ...prev, related_post_ids: currentIds.includes(postId) ? currentIds.filter((id: number) => id !== postId) : [...currentIds, postId] };
    });
  };
  const handleArrayItemChange = (key: string, index: number, field: string, value: string) => {
    const newArray = [...formData[key]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, [key]: newArray }));
  };
  const addArrayItem = (key: string, initial: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: [...prev[key], initial] }));
  };
  const removeArrayItem = (key: string, index: number) => {
    setFormData((prev: any) => ({ ...prev, [key]: prev[key].filter((_: any, i: number) => i !== index) }));
  };

  // --- 顧客管理ロジック ---
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('本当に削除しますか？')) {
      await supabase.from('profiles').delete().eq('id', userId);
      fetchUsers();
    }
  };

  // --- システム設定ロジック ---
  const handleSaveAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const saveData = { email, role, password };

    if (editingAdmin) {
      await supabase.from('admins').update(saveData).eq('id', editingAdmin.id);
    } else {
      await supabase.from('admins').insert([saveData]);
    }
    alert('保存しました');
    setShowAdminModal(false);
    fetchAdmins();
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (window.confirm('削除しますか？')) {
      await supabase.from('admins').delete().eq('id', adminId);
      fetchAdmins();
    }
  };

  // --- ビュー ---

  const DashboardHomeView = () => {
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const totalUsers = isAdmin ? users.length : dashboardStats.totalUsers;
    const uniqueCompanies = isAdmin
      ? new Set(users.map(u => u.company).filter(Boolean)).size
      : dashboardStats.uniqueCompanies;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">公開中の事例数</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{publishedCount} <span className="text-sm font-normal text-gray-400">件</span></h3>
            <div className="text-xs text-gray-500 mt-2">全記事数: {posts.length} 件</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">導入企業数 (ユニーク)</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{uniqueCompanies} <span className="text-sm font-normal text-gray-400">社</span></h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">累計ユーザー数</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalUsers} <span className="text-sm font-normal text-gray-400">名</span></h3>
          </div>
        </div>
      </div>
    );
  };

  const UserManagementView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">顧客アカウント管理</h2>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4">企業名 / 部署</th>
              <th className="p-4">担当者名</th>
              <th className="p-4">メールアドレス</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{user.company}</div>
                  <div className="text-sm text-gray-500">{user.department}</div>
                </td>
                <td className="p-4">{user.name}</td>
                <td className="p-4 font-mono text-sm">{user.email}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-gray-400">ユーザーがいません</div>}
      </div>
      <Pagination
        page={usersPage}
        totalCount={usersTotalCount}
        pageSize={USERS_PAGE_SIZE}
        onChange={(p) => setUsersPage(p)}
        />
    </div>
  );

  const SettingsView = () => (
    <div className="animate-in fade-in duration-300 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center"><Shield size={20} className="mr-2" /> 管理者権限管理</h3>
          <button onClick={() => { setEditingAdmin(null); setShowAdminModal(true); }} className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700 flex items-center gap-1"><Plus size={16} /> 追加</button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">メールアドレス</th>
              <th className="p-3">権限</th>
              <th className="p-3">パスワード(管理別)</th>
              <th className="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id} className="border-b border-gray-100">
                <td className="p-3 font-mono">{admin.email}</td>
                <td className="p-3">{ADMIN_ROLES[admin.role]?.label || admin.role}</td>
                <td className="p-3 text-gray-400 font-mono"><span className="flex items-center"><EyeOff size={14} className="mr-1"/> {admin.password}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditingAdmin(admin); setShowAdminModal(true); }} className="text-gray-400 hover:text-blue-600 mr-2"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteAdmin(admin.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{editingAdmin ? '編集' : '追加'}</h3>
              <button onClick={() => setShowAdminModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">メール</label><input required name="email" defaultValue={editingAdmin?.email} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">権限</label><select name="role" defaultValue={editingAdmin?.role || 'POSTER'} className="w-full p-2 border rounded">{Object.entries(ADMIN_ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label><input required name="password" defaultValue={editingAdmin?.password} className="w-full p-2 border rounded" /></div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-gray-600 border rounded">キャンセル</button><button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded">保存</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // --- PostListView ---
const PostListView = () => (
  <div className="animate-in fade-in duration-300">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">事例データベース管理 (CMS)</h2>

      <div className="flex items-center gap-3">
        {/* 年 */}
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm bg-white"
        >
          <option value="all">年：すべて</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}年</option>
          ))}
        </select>

        {/* 月 */}
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm bg-white"
        >
          <option value="all">月：すべて</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>

        {/* 解除 */}
        <button
          onClick={() => { setFilterYear('all'); setFilterMonth('all'); }}
          className="border px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"
        >
          解除
        </button>

        {/* 新規作成 */}
        <button
          onClick={handleCreateNew}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
        >
          <Plus size={20} /> 新規事例作成
        </button>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-10 text-gray-500">読み込み中...</div>
    ) : (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4">ステータス</th>
              <th className="p-4">タイトル / 企業名</th>
              <th className="p-4">カテゴリ</th>
              <th className="p-4">スコア</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  {post.status === 'published' ? (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">公開</span>
                  ) : post.status === 'private' ? (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">非公開</span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold">下書き</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-bold max-w-xs truncate">{post.title}</div>
                  <div className="text-xs text-gray-500">{post.company}</div>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {CATEGORIES[post.category_type as keyof typeof CATEGORIES]?.label}
                  </span>
                </td>
                <td className="p-4 text-red-600 font-bold">{post.score}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(post)} className="text-gray-400 hover:text-gray-800 p-2 mr-2">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <Pagination
      page={postsPage}
      totalCount={postsTotalCount}
      pageSize={POSTS_PAGE_SIZE}
      onChange={(p) => setPostsPage(p)}
    />
  </div>
);


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen fixed left-0 top-0">
        <div className="p-6 text-white font-bold border-b border-gray-800">炎上.com 管理局</div>
        <nav className="p-4 space-y-2">
  {can.dashboard && (
    <button
      onClick={() => setActiveMenu('dashboard')}
      className={`w-full text-left p-3 rounded ${activeMenu === 'dashboard' ? 'bg-gray-800 text-white' : ''}`}
    >
      ダッシュボード
    </button>
  )}

  {can.posts && (
    <button
      onClick={() => { setActiveMenu('posts'); setViewMode('list'); }}
      className={`w-full text-left p-3 rounded ${activeMenu === 'posts' ? 'bg-gray-800 text-white' : ''}`}
    >
      事例管理
    </button>
  )}

  {can.users && (
    <button
      onClick={() => setActiveMenu('users')}
      className={`w-full text-left p-3 rounded ${activeMenu === 'users' ? 'bg-gray-800 text-white' : ''}`}
    >
      顧客管理
    </button>
  )}

  {can.settings && (
    <button
      onClick={() => setActiveMenu('settings')}
      className={`w-full text-left p-3 rounded ${activeMenu === 'settings' ? 'bg-gray-800 text-white' : ''}`}
    >
      システム設定
    </button>
  )}
  </nav>
      </div>
      <main className="flex-1 ml-64 p-8">
        {activeMenu === 'dashboard' && <DashboardHomeView />}
        {activeMenu === 'posts' && (viewMode === 'list' ? <PostListView /> : (
          <EditView
          formData={formData}
          editingPost={editingPost}
          posts={posts}
          years={years}
          months={months}
          setViewMode={setViewMode}
          handleChange={handleChange}
          handleSavePost={handleSavePost}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          handleArrayItemChange={handleArrayItemChange}
          toggleRelatedPost={toggleRelatedPost}
          SCORE_DEFINITIONS={SCORE_DEFINITIONS}
          INDUSTRIES={INDUSTRIES}
          LISTING_STATUSES={LISTING_STATUSES}
          CATEGORIES={CATEGORIES}
          MEDIA_SOURCES={MEDIA_SOURCES}
          />
          ))}
        {activeMenu === 'users' && <UserManagementView />}
        {activeMenu === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

type EditViewProps = {
  formData: any;
  editingPost: Post | null;
  posts: Post[];
  years: number[];
  months: string[];
  setViewMode: (v: 'list' | 'edit') => void;
  handleChange: (e: any) => void;
  handleSavePost: () => void;
  addArrayItem: (key: string, initial: any) => void;
  removeArrayItem: (key: string, index: number) => void;
  handleArrayItemChange: (key: string, index: number, field: string, value: string) => void;
  toggleRelatedPost: (postId: number) => void;

  SCORE_DEFINITIONS: Record<number, { label: string; desc: string }>;
  INDUSTRIES: string[];
  LISTING_STATUSES: string[];
  CATEGORIES: Record<CategoryKey, CategoryValue>;
  MEDIA_SOURCES: string[];
};

function EditView({
  formData,
  editingPost,
  posts,
  years,
  months,
  setViewMode,
  handleChange,
  handleSavePost,
  addArrayItem,
  removeArrayItem,
  handleArrayItemChange,
  toggleRelatedPost,
  SCORE_DEFINITIONS,
  INDUSTRIES,
  LISTING_STATUSES,
  CATEGORIES,
  MEDIA_SOURCES,
}: EditViewProps)
 {
  if (!formData) return null;
  // スコアの現在の説明を取得
  const currentScore = Math.floor(formData.score) || 1;
  const scoreInfo = SCORE_DEFINITIONS[currentScore] || SCORE_DEFINITIONS[1];

  return (
    <div className="animate-in slide-in-from-right duration-300 max-w-6xl mx-auto pb-20">
      {/* ヘッダー: ステータス操作をここに配置 */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"><ChevronLeft size={24} /></button>
          <div>
             <h2 className="text-xl font-bold text-gray-800">{editingPost ? '事例の編集' : '新規事例の登録'}</h2>
             <p className="text-sm text-gray-500">ID: {editingPost?.id || 'New'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <select 
               name="status" 
               value={formData.status} 
               onChange={handleChange} 
               className={`appearance-none pl-4 pr-10 py-2 rounded-lg font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                 formData.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 
                 formData.status === 'private' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                 'bg-gray-100 text-gray-600 border-gray-300'
               }`}
             >
               <option value="draft">下書き保存</option>
               <option value="private">非公開</option>
               <option value="published">公開する</option>
             </select>
             <ChevronDown size={16} className="absolute right-3 top-3 pointer-events-none opacity-50" />
           </div>
           <button onClick={handleSavePost} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-sm">
             <Save size={18} /> 保存
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 左カラム：メインコンテンツ */}
         <div className="lg:col-span-2 space-y-8">
           
           {/* 基本情報 */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <h3 className="font-bold text-gray-800 flex items-center border-b pb-2"><Info size={18} className="mr-2 text-gray-400" /> 基本情報</h3>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">事例タイトル <span className="text-red-500">*</span></label>
               <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" placeholder="タイトルを入力" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">企業名</label>
                 <input name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border rounded" placeholder="企業名" />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">発生時期</label>
                 <div className="flex gap-2">
                   <select name="dateYear" value={formData.dateYear} onChange={handleChange} className="border p-2 rounded w-1/2">{years.map((y: number) => (<option key={y} value={y}>{y}年</option>))}</select>
                   <select name="dateMonth" value={formData.dateMonth} onChange={handleChange} className="border p-2 rounded w-1/2">{months.map((m: string) => (<option key={m} value={m}>{m}月</option>))}</select>
                 </div>
               </div>
             </div>
           </div>

           {/* 分析コンテンツ */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
             <h3 className="font-bold text-gray-800 flex items-center border-b pb-2"><FileText size={18} className="mr-2 text-gray-400" /> 分析コンテンツ</h3>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">概要 (Summary)</label>
               <textarea name="summary" value={formData.summary} onChange={handleChange} rows={4} className="w-full p-2 border rounded text-sm" placeholder="事実ベースで概要を記述" />
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-bold text-red-600 mb-1">実害・インパクト</label>
                 <textarea name="impact" value={formData.impact} onChange={handleChange} rows={5} className="w-full p-2 border border-red-100 bg-red-50 rounded text-sm" placeholder="箇条書きで入力（改行区切り）" />
               </div>
              </div>
             </div>

           {/* タイムライン */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
               <h3 className="font-bold text-gray-800 flex items-center"><Clock size={18} className="mr-2 text-gray-400" /> タイムライン</h3>
               <button onClick={() => addArrayItem('timeline', { day: '', title: '', desc: '' })} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center"><Plus size={14} className="mr-1" /> 行を追加</button>
             </div>
             <div className="space-y-3">
               {formData.timeline.map((t: any, i: number) => (
                 <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                   <input value={t.day} onChange={(e) => handleArrayItemChange('timeline', i, 'day', e.target.value)} className="w-20 border p-1 rounded text-center text-red-500 font-bold" placeholder="Day 0" />
                   <div className="flex-1 space-y-2">
                     <input value={t.title} onChange={(e) => handleArrayItemChange('timeline', i, 'title', e.target.value)} className="w-full border p-1 rounded font-bold" placeholder="タイトル" />
                     <textarea value={t.desc} onChange={(e) => handleArrayItemChange('timeline', i, 'desc', e.target.value)} rows={2} className="w-full border p-1 rounded text-sm" placeholder="詳細" />
                   </div>
                   <button onClick={() => removeArrayItem('timeline', i)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                 </div>
               ))}
             </div>
           </div>
           
           {/* 関連記事 */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
               <h3 className="font-bold text-gray-800 flex items-center"><Newspaper size={18} className="mr-2 text-gray-400" /> 関連記事・メディア報道</h3>
               <button onClick={() => addArrayItem('related_links', { source: 'Yahoo!ニュース', title: '', url: '' })} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center"><Plus size={14} className="mr-1" /> 追加</button>
             </div>
             <div className="space-y-3">
               {formData.related_links.map((l: any, i: number) => (
                 <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-100">
                   <select value={l.source} onChange={(e) => handleArrayItemChange('related_links', i, 'source', e.target.value)} className="border p-1 rounded text-xs w-32">{MEDIA_SOURCES.map((s: string) => (<option key={s} value={s}>{s}</option>))}</select>
                   <input value={l.title} onChange={(e) => handleArrayItemChange('related_links', i, 'title', e.target.value)} className="flex-1 border p-1 rounded text-sm" placeholder="記事タイトル" />
                   <input value={l.url} onChange={(e) => handleArrayItemChange('related_links', i, 'url', e.target.value)} className="flex-1 border p-1 rounded text-sm text-blue-500" placeholder="URL" />
                   <button onClick={() => removeArrayItem('related_links', i)}><X size={16}/></button>
                 </div>
               ))}
             </div>
           </div>
         </div>

         {/* 右カラム：属性・設定 */}
         <div className="lg:col-span-1 space-y-6">
           
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">カテゴリ属性</h3>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">業界</label>
               <select name="industry" value={formData.industry} onChange={handleChange} className="w-full border p-2 rounded bg-white">{INDUSTRIES.map((i: string) => (<option key={i} value={i}>{i}</option>))}</select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">上場区分</label>
               <select name="listing_status" value={formData.listing_status} onChange={handleChange} className="w-full border p-2 rounded bg-white">{LISTING_STATUSES.map((s: string) => (<option key={s} value={s}>{s}</option>))}</select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">炎上カテゴリ</label>
               <select name="category_type" value={formData.category_type} onChange={handleChange} className="w-full border p-2 rounded bg-white">{(Object.entries(CATEGORIES) as [CategoryKey, CategoryValue][]).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">タグ (カンマ区切り)</label>
               <input name="tags" value={formData.tags} onChange={handleChange} className="w-full border p-2 rounded" />
             </div>
             
             <div className="relative">
               <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center"><Link size={14} className="mr-1" /> 類似事例の紐付け (複数可)</label>
               <div className="h-60 overflow-y-auto border p-2 rounded bg-gray-50">
                 {posts.filter(p => p.id !== editingPost?.id).map(p => (
                   <div key={p.id} className="flex items-start gap-2 cursor-pointer hover:bg-white p-1 rounded transition" onClick={() => toggleRelatedPost(p.id)}>
                     <div className={`mt-1 w-4 h-4 border rounded flex items-center justify-center ${formData.related_post_ids.includes(p.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                       {formData.related_post_ids.includes(p.id) && <Check size={12} className="text-white" />}
                     </div>
                     <div>
                       <div className="text-xs font-bold text-gray-700 truncate w-40">{p.title}</div>
                       <div className="text-[10px] text-gray-400">{p.company}</div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
             <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">スコアリング</h3>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">影響度スコア: <span className="text-red-600 text-xl">★{parseFloat(formData.score).toFixed(1)}</span></label>
               <input type="range" name="score" min="1.0" max="5.0" step="1.0" value={formData.score} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 mb-2" />
               <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                 <p className="font-bold text-red-800 text-sm mb-1">{scoreInfo.label}</p>
                 <p className="text-xs text-gray-600 leading-snug">{scoreInfo.desc}</p>
               </div>
             </div>
           </div>
         </div>
     </div>
  </div>
);
}
