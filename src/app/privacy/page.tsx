"use client";

import Link from "next/link";
import { Flame, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition"
            >
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            プライバシーポリシー
          </h1>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-h3:mt-8 prose-h3:mb-3">
            <p>
              Flock株式会社（以下「当社」といいます。）は、当社が提供するサービス「炎上.com」（以下「本サービス」といいます。）における、
              ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第1条（個人情報）</h3>
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、
              当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、
              および容貌、指紋、声紋にかかるデータ、および健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報
              （個人識別符号）を指します。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第2条（収集する情報）</h3>
            <p>
              当社は、本サービスの提供にあたり、以下の情報を適法かつ公正な手段で取得します。
            </p>
            <ul>
              <li>
                <strong>登録情報</strong>：氏名、メールアドレス（企業ドメイン）、会社名、部署名、役職、電話番号等。
              </li>
              <li>
                <strong>利用履歴</strong>：ログインログ、閲覧した事例のカテゴリ、検索キーワード、ページ滞在時間、クリック履歴等。
              </li>
              <li>
                <strong>端末情報</strong>：IPアドレス、ブラウザの種類、OS情報、Cookie情報等。
              </li>
            </ul>

            <div className="h-6" />
            <h3 className="font-bold">第3条（利用目的）</h3>
            <p>当社が個人情報を収集・利用する目的は、以下のとおりです。</p>
            <ul>
              <li>
                本サービスの提供・運営（本人確認、認証、会員資格の確認）のため。
              </li>
              <li>
                ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）。
              </li>
              <li>
                本サービスのメンテナンス、重要なお知らせなど必要に応じたご連絡のため。
              </li>
              <li>
                利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため。
              </li>
              <li>
                ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため。
              </li>
              <li>有料サービスにおいて、ユーザーに利用料金を請求するため。</li>
              <li>
                利用状況の分析および本サービスの改善・新機能の開発のため。
              </li>
              <li>
                当社または第三者（提携先企業を含む）の商品・サービスに関する広告・宣伝、販売勧誘（電子メールの送信を含む）のため。
              </li>
              <li>上記の利用目的に付随する目的。</li>
            </ul>

            <div className="h-6" />
            <h3 className="font-bold">第4条（外部サービス・クラウドの利用）</h3>
            <p>
              本サービスは、システム基盤として第三者サービス等を利用しており、ユーザーのデータは各サービスのサーバー（国内外問わず）に
              保存される場合があります。当社は、これらの委託先に対し、適切な安全管理措置を講じていることを確認した上で利用します。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第5条（個人情報の第三者提供・提携先への提供）</h3>
            <p>
              当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
            </p>
            <ul>
              <li>法令に基づく場合</li>
              <li>
                人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
              <li>
                公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
              <li>
                国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、
                本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
              </li>
              <li>
                予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき
                <ul>
                  <li>利用目的に第三者への提供を含むこと</li>
                  <li>第三者に提供されるデータの項目</li>
                  <li>第三者への提供の手段または方法</li>
                  <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                  <li>本人の求めを受け付ける方法</li>
                </ul>
              </li>
            </ul>

            <div className="h-4" />
            <p>
              <strong>【提携先企業への提供に関する同意】</strong>
              <br />
              前項にかかわらず、当社は、ユーザーにとって有益と思われる情報（リスク管理ソリューション、セミナー、関連サービス等）を提供するため、
              当社の提携先企業（以下「パートナー企業」といいます。）に対して、ユーザーの個人情報を提供する場合があります。
              ユーザーは、本サービスの利用登録（本ポリシーへの同意）を行った時点で、これに同意したものとみなされます。
            </p>
            <ul>
              <li>
                <strong>(1) 提供する目的</strong>
                <ul>
                  <li>パートナー企業が取り扱う商品・サービスに関する広告、宣伝、販売勧誘等のため</li>
                  <li>パートナー企業主催のセミナー、イベント等の案内のため</li>
                </ul>
              </li>
              <li>
                <strong>(2) 提供する個人情報の項目</strong>
                <ul>
                  <li>氏名、メールアドレス、会社名、部署名、役職、電話番号</li>
                  <li>本サービスの利用履歴（関心領域データ等）</li>
                </ul>
              </li>
              <li>
                <strong>(3) 提供の手段または方法</strong>
                <ul>
                  <li>
                    書面または電磁的な方法（セキュリティ対策を施したデータ送信等）による交付
                  </li>
                </ul>
              </li>
              <li>
                <strong>(4) 提供の停止（オプトアウト）</strong>
                <ul>
                  <li>
                    ユーザーは、当社所定の手続きを行うことにより、パートナー企業への個人情報の提供を停止することができます。
                    停止を希望される場合は、下記お問い合わせ窓口までご連絡ください。
                  </li>
                </ul>
              </li>
            </ul>

            <div className="h-6" />
            <h3 className="font-bold">第6条（個人情報の開示）</h3>
            <p>
              当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
              ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、
              開示しない決定をした場合には、その旨を遅滞なく通知します。
            </p>
            <ul>
              <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
              <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
              <li>その他法令に違反することとなる場合</li>
            </ul>

            <div className="h-6" />
            <h3 className="font-bold">第7条（個人情報の訂正および削除）</h3>
            <p>
              ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、
              当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます。）を請求することができます。
            </p>
            <p>
              当社は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、
              当該個人情報の訂正等を行うものとします。
            </p>
            <p>
              当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、
              これをユーザーに通知します。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第8条（個人情報の利用停止等）</h3>
            <p>
              当社は、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、
              その利用の停止または消去（以下「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。
            </p>
            <p>
              前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、
              当該個人情報の利用停止等を行います。
            </p>
            <p>
              当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、
              遅滞なく、これをユーザーに通知します。
            </p>

            <div className="h-6" />
            <h3 className="font-bold">第9条（プライバシーポリシーの変更）</h3>
            <p>
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、
              変更することができるものとします。
            </p>
            <p>
              当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
            </p>

            <div className="h-6" />
            <hr />

            <div className="h-6" />
            <p className="text-s text-gray-500">お問い合わせ先</p>
            <p className="text-sm text-gray-700 m-0">Flock株式会社</p>
            <p className="text-sm text-gray-700 m-0">info@flock-inc.com</p>
            <p className="text-sm text-gray-700 m-0">2026年1月13日制定</p>
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
              <p className="text-gray-500 text-xs">
                © 2026 Flock Inc. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-300 text-sm">サービス</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
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
              <h4 className="font-bold mb-4 text-gray-300 text-sm">
                規約・お問い合わせ
              </h4>
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
