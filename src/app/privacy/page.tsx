"use client";

import Link from "next/link";
import { Flame, Mail } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-h3:mt-8 prose-h3:mb-3">
            <p>
              Flock株式会社は、本サービスの利用における個人情報の取り扱いについて以下の通り定めます。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第1条（個人情報）</h3>
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、
              当該情報に含まれる氏名、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第2条（個人情報の収集方法）</h3>
            <p>
              当社は、ユーザーが利用登録をする際に氏名、会社名、部署名、メールアドレスなどの個人情報をお尋ねすることがあります。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第3条（個人情報の利用目的）</h3>
            <ul>
              <li>本サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>新機能、更新情報、キャンペーン等および当社が提供する他のサービスの案内のメール送付のため</li>
              <li>メンテナンス、重要なお知らせ等必要に応じたご連絡のため</li>
              <li>規約違反や不正利用の防止のため</li>
            </ul>

            <div className="h-6" />
            <h3 className="font-bold">第4条（利用目的の変更）</h3>
            <p>
              当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
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