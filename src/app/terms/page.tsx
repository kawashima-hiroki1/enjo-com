"use client";

import Link from "next/link";
import { Flame, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <Flame className="text-red-500 fill-red-500" size={28} />
              <span className="text-xl font-bold tracking-tight">炎上.com</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-bold text-gray-300 hover:text-white transition"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">利用規約</h1>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-h3:mt-10 prose-h3:mb-3">

            <h3 className="font-bold">第1条（目的・定義）</h3>
            <p>
              本規約は、Flock株式会社（以下「当社」）が提供する炎上事例データベース「炎上.com」の利用条件を定めるものです。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第2条（情報の性質と免責）</h3>
            <p>
              本サービスで提供される情報は、過去の公知の事実および当社独自の分析に基づくものです。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第3条（禁止事項）</h3>
            <p>
              会員は、本サービスで得た情報を自社の内部利用（社内教育、リスク管理）に限定し、第三者への開示・転送・販売・出版を行ってはなりません。
              スクレイピング等による自動的なデータ収集は固く禁じます。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第4条（反社会的勢力の排除）</h3>
            <p>
              会員は、自らが反社会的勢力でないこと、および反社会的勢力と関わりを持たないことを表明し、保証するものとします。
            </p>

            <div className="h-6" />
            <hr />
            
            <div className="h-6" />
            <p className="text-s text-gray-500">
              お問い合わせ先
            </p>
            info@flock-inc.com
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-red-500 fill-red-500" size={24} />
                <span className="text-xl font-bold tracking-tight">炎上.com</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                失敗から学ぶ、リスクマネジメント。<br />
                企業のリスク対策を支援するデータベースサービス。
              </p>
              <p className="text-gray-500 text-xs">© 2026 Flock Inc. All rights reserved.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-300 text-sm">サービス</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="hover:text-white transition"
                  >
                    ページ上部へ
                  </button>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition">
                    事例検索へ戻る
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-300 text-sm">規約・お問い合わせ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    プライバシーポリシー
                  </Link>
                </li>
                <li className="pt-2">
                  <a
                    href="mailto:info@flock-inc.com"
                    className="flex items-center gap-2 hover:text-white text-gray-300 transition"
                  >
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
}