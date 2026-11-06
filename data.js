/**
 * プロフィールデータ設定ファイル
 * 岸 幸之介（キシ コウノスケ）さん仕様
 */
const PROFILE_DATA = {
  // 基本情報
  name: "岸 幸之介",
  nameKana: "キシ コウノスケ",
  title: "クラウド・Web開発 & エッジLLM研究者",
  tagline: "🔥 11月中旬からラボ常駐したい！",
  avatarImg: "avatar.jpg", // 切り抜いたプロフィール写真
  originalCardImg: "profile-original.jpg",
  statusBadge: "🚀 11月中旬〜 ラボ常駐希望！",

  // 解放スコア条件
  unlockRequirements: {
    target: 1,      // スコア1: 目標・アピール
    tech: 3,        // スコア3: 技術・エッジLLM研究
    activity: 6,    // スコア6: 活動・業務委託・インターン
    hobbies: 9,     // スコア9: 趣味・好きなカルチャー
    labGoal: 12,    // スコア12: ラボ常駐に向けた意気込み
    contact: 15     // スコア15: 完全制覇 & ラボ常駐確定！
  },

  // 1. 宣言・ターゲット (スコア1)
  target: {
    title: "Mission / 目標",
    icon: "fa-bullseye",
    badge: "HOT",
    headline: "11月中旬からラボ常駐したい！",
    desc: "エッジLLMの研究やクラウド/Web開発の実践知を深めるため、11月中旬からのラボ常駐を熱望しています！持ち前のフットワークの軽さと貪欲なキャッチアップ力で、研究室・チームの推進力になります。"
  },

  // 2. 技術 & 研究内容 (スコア3)
  tech: {
    title: "Tech & Research / 技術と研究",
    icon: "fa-microchip",
    research: {
      title: "🔬 研究テーマ：エッジLLM (Edge LLM)",
      desc: "リソース制約のあるエッジデバイス上で大規模言語モデル（LLM）をいかに軽量・高速・低消費電力に動かすかを追究。モデルの量子化（Quantization）、枝刈り、オンデバイス推論の最適化に取り組んでいます。"
    },
    skills: [
      {
        name: "LLM / AI",
        tags: ["エッジLLM", "プロンプトエンジニアリング", "量子化 (GGML/AWQ)", "Hugging Face", "Python", "PyTorch"]
      },
      {
        name: "Cloud (AWS)",
        tags: ["AWS Lambda", "EC2", "S3", "API Gateway", "CloudWatch", "IAM / 権限設計", "クラウドアーキテクチャ"]
      },
      {
        name: "Web系開発",
        tags: ["TypeScript", "JavaScript", "React / Next.js", "Node.js", "REST API", "Tailwind CSS"]
      }
    ]
  },

  // 3. 活動実績 (スコア6)
  activity: {
    title: "Activities & Experience / 活動実績",
    icon: "fa-briefcase",
    items: [
      {
        title: "業務委託（クラウドエンジニア）",
        tag: "Cloud / AWS",
        desc: "AWS環境を中心としたインフラ設計・運用・構築支援。実案件での可用性・セキュリティを意識したクラウド基盤の構築に携わっています。"
      },
      {
        title: "AI関連の塾講師",
        tag: "AI Education",
        desc: "受講生へのAI・プログラミング指導。難解なAIの数理や実装概念を分かりやすく言語化し、人に伝えるコミュニケーション力を培っています。"
      },
      {
        title: "長期インターンシップ",
        tag: "Long-term Intern",
        desc: "プロダクト開発現場でのチーム開発、要件定義から実装・レビューを通じた実践的なソフトウェアエンジニアリングを経験。"
      }
    ]
  },

  // 4. 趣味・カルチャー (スコア9)
  hobbies: {
    title: "Hobbies & Culture / 趣味・好きなこと",
    icon: "fa-heart",
    items: [
      {
        category: "SPORTS",
        icon: "fa-futbol",
        name: "サッカー ⚽",
        desc: "チームワークと状況判断力、ピッチを走り切るスタミナの原点！"
      },
      {
        category: "MANGA",
        icon: "fa-book-open",
        name: "キングダム / JoJo ⚔️",
        desc: "熱い戦術・リーダーシップ（キングダム）と、人間讃歌・ユニークな発想力（ジョジョ）に夢中！"
      },
      {
        category: "MUSIC",
        icon: "fa-music",
        name: "Vaundy / Official髭男dism 🎧",
        desc: "ハイセンスなメロディと歌詞。コーディングやリサーチのお供にヘビロテ中。"
      },
      {
        category: "LOVE",
        icon: "fa-dog",
        name: "犬 🐶",
        desc: "癒やしの源。実直で人懐っこい犬が大好きです。"
      }
    ]
  },

  // 5. ラボ常駐へのコミットメント (スコア12)
  labGoal: {
    title: "Why Lab? / ラボで実現したいこと",
    icon: "fa-flask-vial",
    points: [
      "エッジLLMの最前線研究に没頭し、成果（論文・実装・OSS）を残す",
      "クラウド実務で培ったインフラ知見を研究環境構築や実験効率化に還元する",
      "メンバーと活発に議論し、切磋琢磨できるラボの雰囲気を盛り上げる"
    ]
  },

  // 6. コンタクト (スコア15)
  contact: {
    title: "Connect / お問い合わせ・面談",
    icon: "fa-handshake",
    message: "「11月中旬からラボ常駐したい！」という熱意を直接お伝えさせてください。いつでもご連絡お待ちしております！",
    email: "kounosuke.kishi.lab@example.com",
    links: [
      { name: "ラボ常駐について連絡する", icon: "fa-envelope", url: "mailto:kounosuke.kishi.lab@example.com?subject=ラボ常駐について" },
      { name: "自己紹介スライド（元画像）", icon: "fa-image", url: "profile-original.jpg" }
    ]
  }
};
