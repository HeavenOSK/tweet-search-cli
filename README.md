# Tweet Search CLI

Twitterアーカイブのツイートをローカルで検索できるCLIツールです。Like検索とベクトル検索の両方をサポートしています。

## 機能

- **データベース登録**: Twitterアーカイブの`tweets.js`ファイルからツイートをSQLiteデータベースに登録
- **埋め込み生成**: OpenAI APIを使用してツイートの埋め込みベクトルを生成（オプション）
- **Like検索**: SQLiteのFTS5を使用した全文検索
- **ベクトル検索**: 埋め込みベクトルを使用した意味的類似度検索

## セットアップ

### 必要条件

- Node.js 18以上
- pnpm（推奨）またはnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/HeavenOSK/tweet-search-cli.git
cd tweet-search-cli

# 依存関係をインストール
pnpm install
```

### 環境変数の設定

ベクトル検索を使用する場合は、OpenAI APIキーが必要です：

```bash
cp .env.example .env
# .envファイルを編集してOPENAI_API_KEYを設定
```

## 使い方

### ツイートの登録

Twitterアーカイブから`tweets.js`ファイルを指定して登録します：

```bash
# 埋め込みベクトルも生成する場合（OpenAI APIキーが必要）
pnpm start register target/tweets.js

# 埋め込みベクトルをスキップする場合
pnpm start register target/tweets.js --skip-embedding
```

### ツイートの検索

#### Like検索（全文検索）

```bash
pnpm start search "検索キーワード"

# 検索結果数を指定
pnpm start search "検索キーワード" -l 50
```

#### ベクトル検索（意味的類似度検索）

```bash
pnpm start search "検索したい内容" -m vector

# 検索結果数を指定
pnpm start search "検索したい内容" -m vector -l 30
```

## データベースの場所

ツイートデータベースは以下の場所に保存されます：
- macOS/Linux: `~/.tweet-search/tweets.db`
- Windows: `%USERPROFILE%\.tweet-search\tweets.db`

## 開発

```bash
# 開発モード（ファイル変更を監視）
pnpm dev

# 型チェック
pnpm build

# リント/フォーマット
pnpm check:fix
```

## ライセンス

ISC