# 🐦 Flappy Portfolio (フラッピーバード × 自己紹介サイト)

Flappy Bird（障害物回避ゲーム）とエンジニアの自己紹介（ポートフォリオ）を融合させた、インタラクティブなWebサイトです。

## ✨ 特徴

1. **ゲームと連動したアンロックシステム**:
   - プレイヤー（鳥 / エンジニアアバター）が障害物（「404 NotFound」「Bug」「納期」「仕様変更」など）をくぐり抜けるとスコアが加算されます。
   - スコアに応じて、プロフィール情報が順次アンロックされていきます！
     - 1点: 自己紹介（About Me）
     - 3点: スキルセット（Tech Stack）
     - 6点: 経歴（Career & Milestones）
     - 9点: 制作実績（Featured Projects）
     - 12点: 趣味・価値観（Hobbies & Values）
     - 15点: お問い合わせ（Contact & Social）
2. **CDNのみで構成（ビルド・インストール不要）**:
   - Tailwind CSS CDN
   - Font Awesome 6 CDN
   - Canvas-Confetti CDN
   - Web Audio API（シンセサイザーによるレトロな8bit風ジャンプ音・コイン音・アンロックファンファーレ）
3. **忙しい閲覧者への配慮（スキップ機能）**:
   - ヘッダーの「全セクションを即時表示」トグルをオンにすれば、ゲームをプレイしなくても全プロフィールを今すぐ閲覧可能です。
4. **簡単なカスタマイズ**:
   - `data.js` を開いてテキストやリンクを書き換えるだけで、自分の自己紹介サイトが完成します。

## 🚀 閲覧方法

ブラウザで `index.html` を直接ダブルクリックして開くか、ローカルサーバーを起動してアクセスできます。

```powershell
# 例: VS CodeのLive Server や Pythonの簡易サーバー
cd C:\Users\81809\.gemini\antigravity\scratch\flappy-portfolio
python -m http.server 8000
```
ブラウザで `http://localhost:8000` を開きます。

## 🛠 カスタマイズ方法 (`data.js`)

`data.js` にすべての自己紹介データがまとまっています：
- `name`: お名前
- `title`: 肩書・職種
- `tagline`: キャッチコピー
- `bio`: 自己紹介文
- `skills`: 保有技術スタック
- `experience`: 経歴・職歴タイムライン
- `projects`: 主な開発プロジェクトや制作物
- `hobbies`: 趣味や大切にしている価値観
- `contact`: 連絡先メールアドレスやSNSリンク
