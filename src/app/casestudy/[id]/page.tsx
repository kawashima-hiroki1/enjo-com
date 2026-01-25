"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { 
  ArrowLeft, Flame, Building2, Calendar, ExternalLink, 
  Clock, AlertTriangle, Info, Newspaper, Link as LinkIcon,
  Star
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: Record<string, { label: string; color: string }> = {
  CREATIVE: { label: 'クリエイティブ表現', color: 'bg-purple-100 text-purple-800' },
  SERVICE: { label: '商品・サービス・接客', color: 'bg-orange-100 text-orange-800' },
  GOVERNANCE: { label: '企業コンプライアンス', color: 'bg-gray-100 text-gray-800' },
  COMMUNICATION: { label: 'SNSコミュニケーション', color: 'bg-blue-100 text-blue-800' },
};

export default function CaseStudyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setPost(data);

      // 類似事例を取得
      if (data.related_post_ids && data.related_post_ids.length > 0) {
        const { data: related } = await supabase
          .from('posts')
          .select('*')
          .in('id', data.related_post_ids)
          .eq('status', 'published');

        setRelatedPosts(related || []);
      }

      setLoading(false);
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">事例が見つかりません</h1>
        <Link href="/" className="text-red-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  const categoryObj = CATEGORIES[post.category_type] || CATEGORIES.CREATIVE;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="text-red-500 fill-red-500" size={28} />
              <span className="text-xl font-bold tracking-tight">炎上.com</span>
            </Link>
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              戻る
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タイトルセクション */}
        <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs px-2 py-1 rounded font-medium ${categoryObj.color}`}>
              {categoryObj.label}
            </span>
            <span className="text-sm text-gray-300">{post.date} 発生</span>
            <span className="text-sm text-gray-300">| {post.industry}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400 mr-3">影響度スコア</span>
              {renderStars(post.score)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* 概要 */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Info size={16} className="mr-2" /> 炎上の経緯・概要
              </h2>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.summary}
              </p>
            </section>

            {/* 実害 */}
            {post.impact && post.impact.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center">
                  <AlertTriangle size={16} className="mr-2" /> 企業への実害・インパクト
                </h2>
                <ul className="space-y-2">
                  {post.impact.map((text: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span className="text-gray-800 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* タイムライン */}
            {post.timeline && post.timeline.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                  <Clock size={16} className="mr-2" /> タイムライン
                </h2>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-300"></div>
                  <div className="space-y-6 relative">
                    {post.timeline.map((step: any, index: number) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="relative z-10 w-6 h-6 flex-shrink-0 bg-white border-2 border-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-bold text-sm text-red-600">{step.day}</span>
                            <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 leading-snug whitespace-pre-wrap">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 企業情報 */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">企業属性データ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">企業名</span>
                  <span className="font-medium">{post.company}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">業界</span>
                  <span className="font-medium">{post.industry}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">上場区分</span>
                  <span className="font-medium">{post.listing_status}</span>
                </div>
              </div>
            </div>

            {/* 関連記事 */}
            {post.related_links && post.related_links.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                  <Newspaper size={14} className="mr-2" /> 関連記事・メディア報道
                </h3>
                <ul className="text-sm space-y-2">
                  {post.related_links.map((link: any, idx: number) => (
                    <li key={idx}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 hover:bg-gray-100 p-1.5 rounded transition"
                      >
                        <ExternalLink size={14} className="text-gray-400 mt-0.5 group-hover:text-blue-500" />
                        <div>
                          <span className="text-xs font-bold text-gray-500 block">
                            {link.source}
                          </span>
                          <span className="text-gray-800 group-hover:text-blue-600 group-hover:underline leading-snug">
                            {link.title}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 類似事例 */}
            {relatedPosts.length > 0 && (
              <div className="bg-yellow-50 p-5 rounded-xl shadow-sm border border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-3 text-sm flex items-center">
                  <LinkIcon size={14} className="mr-2" /> 類似事例
                </h3>
                <ul className="text-sm space-y-3 text-yellow-900">
                  {relatedPosts.map((related: any) => (
                    <li key={related.id}>
                      <Link 
                        href={`/casestudy/${related.id}`}
                        className="hover:underline flex items-start gap-2"
                      >
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{related.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">© 2026 Flock Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
