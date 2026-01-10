"use client";

import Link from "next/link";
import { Flame, Mail } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">利用規約</h1>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-h3:mt-10 prose-h3:mb-3 prose-ul:my-3 prose-ol:my-3">
            <p>
              この利用規約（以下「本規約」といいます。）は、Flock株式会社（以下「当社」といいます。）が提供するサービス「炎上.com」（以下「本サービス」といいます。）の利用条件を定めるものです。
              本サービスの利用登録を行った法人及びその従業員（以下「ユーザー」といいます。）は、本規約に従って本サービスを利用するものとします。
            </p>

            <h3 className="font-bold">第1条（適用）</h3>
            <ol className="list-decimal pl-5">
              <li>
                本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
              </li>
              <li>
                当社が本サービス上で掲載する利用ガイド、注意事項等は、本規約の一部を構成するものとします。
              </li>
            </ol>

            <h3 className="font-bold">第2条（利用登録・法人限定）</h3>
            <ol className="list-decimal pl-5">
              <li>
                登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </li>
              <li>
                本サービスは、法人または組織の広報・リスク管理・教育利用を目的としたBtoBサービスです。当社は、以下のいずれかの事由に該当する場合、利用登録の申請を承認しない、または承認を取り消すことがあります。
                <ul className="list-disc pl-5">
                  <li>
                    フリーメールアドレス（Gmail, Yahoo!, Outlook, iCloud等）その他、所属企業・組織の実在性が確認できないドメインのメールアドレスを使用した場合。
                  </li>
                  <li>個人名義での登録、または個人利用を目的とする場合。</li>
                  <li>競合他社による登録と当社が判断した場合。</li>
                  <li>過去に本規約違反等により利用停止処分を受けている場合。</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合。</li>
                </ul>
              </li>
            </ol>

            <h3 className="font-bold">第3条（ユーザーIDおよびパスワードの管理）</h3>
            <ol className="list-decimal pl-5">
              <li>
                ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
              </li>
              <li>
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者（同一法人内の未登録者を含む）に譲渡または貸与し、もしくは第三者と共用することはできません。
              </li>
            </ol>

            <h3 className="font-bold">第4条（サービス業務の再委託）</h3>
            <p>
              当社は、本サービスの提供に関する業務の全部または一部を、当社の責任において第三者（クラウドサーバー提供者、システム開発会社、コンテンツ制作会社等を含みますがこれらに限られません）に再委託できるものとします。
            </p>

            <h3 className="font-bold">第5条（知的財産権・情報の利用範囲）</h3>
            <ol className="list-decimal pl-5">
              <li>
                本サービスに含まれるデータベース、文章、画像、プログラム、システム構成等の知的財産権は、当社または正当な権利者に帰属します。
              </li>
              <li>
                ユーザーは、本サービスで得た情報を、自社の社内教育、リスク管理、経営判断等の内部利用の範囲内でのみ利用できるものとします。
              </li>
              <li>
                ユーザーは、本サービスのコンテンツ（事例分析、タイムライン等）を複製し、外部メディア、SNS、ブログ等へ転載・公開すること、および本サービスのデータを活用して類似のデータベースやサービスを作成・提供することを禁じられます。
              </li>
            </ol>

            <h3 className="font-bold">第6条（情報の正確性・削除権限・免責）</h3>
            <ul className="list-disc pl-5">
              <li>
                【現状有姿】 本サービスは、現在無料で提供されるものであり、「現状有姿（As-Is）」で提供されます。当社は、本サービスに事実上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
              </li>
              <li>
                【情報の出典と削除】 本サービス上の事例データは公開情報を基に編集されたものです。当社は、対象となる企業・団体・個人等から権利侵害の申告があった場合、または内容に誤りや不適切な点があると当社が判断した場合、ユーザーへの事前通知なく、当該情報の閲覧制限、非公開化、または削除を行うことができるものとし、これに対してユーザーは異議を申し立てることはできません。
              </li>
              <li>
                当社は、本サービスの利用に起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
              </li>
            </ul>

            <h3 className="font-bold">第7条（禁止事項）</h3>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-5">
              <li>法令または公序良俗に違反する行為。</li>
              <li>犯罪行為に関連する行為。</li>
              <li>
                本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為。
              </li>
              <li>
                当社、他のユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為（スクレイピング、クローリング、過度なアクセス等）。
              </li>
              <li>
                本サービスによって得られた情報を商業的に利用する行為（ただし、当社が別途認めた場合を除く）。
              </li>
              <li>当社のサービスの運営を妨害するおそれのある行為。</li>
              <li>不正アクセスをし、またはこれを試みる行為。</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為。</li>
              <li>不正な目的を持って本サービスを利用する行為。</li>
              <li>
                本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為。
              </li>
              <li>他のユーザーに成りすます行為。</li>
              <li>当社が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為。</li>
              <li>面識のない異性との交際を目的とする行為。</li>
              <li>その他、当社が不適切と判断する行為。</li>
            </ul>

            <h3 className="font-bold">第8条（本サービスの停止等）</h3>
            <p>
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul className="list-disc pl-5">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合。</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合。</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合。</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合。</li>
            </ul>
            <p>
              当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
            </p>

            <h3 className="font-bold">第9条（サービス内容の変更等）</h3>
            <p>
              当社は、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を中止（終了）することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
            </p>

            <h3 className="font-bold">第10条（利用制限および登録抹消）</h3>
            <p>
              当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
            </p>
            <ul className="list-disc pl-5">
              <li>本規約のいずれかの条項に違反した場合。</li>
              <li>登録事項に虚偽の事実があることが判明した場合。</li>
              <li>その他、当社が本サービスの利用を適当でないと判断した場合。</li>
            </ul>
            <p>
              当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
            </p>

            <h3 className="font-bold">第11条（反社会的勢力の排除）</h3>
            <ol className="list-decimal pl-5">
              <li>
                ユーザーは、現在および将来にわたり、自らが暴力団、暴力団員、暴力団準構成員、総会屋等、社会運動等標榜ゴロ、その他これらに準ずる者（以下「反社会的勢力」といいます。）に該当しないことを表明し、保証するものとします。
              </li>
              <li>
                当社は、ユーザーが反社会的勢力に該当すると判断した場合、何らの通知催告を要せず、直ちに本サービスの利用を停止し、登録を抹消できるものとします。
              </li>
            </ol>

            <h3 className="font-bold">第12条（個人情報の取扱い・提携先への提供）</h3>
            <ol className="list-decimal pl-5">
              <li>
                当社によるユーザーの個人情報の取扱いは、別途定める「プライバシーポリシー」に従うものとします。
              </li>
              <li>
                【マーケティング・リード提供】 ユーザーは、当社がプライバシーポリシーに定める範囲で、ユーザーの登録情報および利用履歴を分析し、当社または当社の提携先企業（パートナー企業）に対し、ユーザーの登録情報（リード情報）を提供すること、および当社または提携先企業から広告・宣伝・営業活動（電子メールの送信、電話等を含む）を受ける場合があることに予め承諾するものとします。
              </li>
            </ol>

            <h3 className="font-bold">第13条（通知または連絡）</h3>
            <p>
              ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは発信時にユーザーへ到達したものとみなします。
            </p>

            <h3 className="font-bold">第14条（権利義務の譲渡の禁止）</h3>
            <p>
              ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
            </p>

            <h3 className="font-bold">第15条（準拠法・裁判管轄）</h3>
            <p>
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する地方裁判所（東京地方裁判所）を第一審の専属的合意管轄裁判所とします。
            </p>

            <div className="h-6" />
            <hr />

            <div className="h-6" />
            <p className="text-s text-gray-500">お問い合わせ先</p>
            <p className="m-0">
              <a
                href="mailto:info@flock-inc.com"
                className="text-gray-700 hover:text-gray-900 underline underline-offset-4"
              >
                info@flock-inc.com
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-500">2026年1月13日制定</p>
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
