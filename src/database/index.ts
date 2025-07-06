import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { SCHEMA, type Tweet } from "./schema.js";

export class TweetDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const defaultPath = join(homedir(), ".tweet-search", "tweets.db");
    const path = dbPath || defaultPath;

    // Ensure directory exists
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.setup();
  }

  private setup() {
    this.db.exec(SCHEMA);
  }

  insertTweet(tweet: Tweet): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO tweets (id, created_at, full_text, favorite_count, retweet_count, lang, embedding)
      VALUES (@id, @created_at, @full_text, @favorite_count, @retweet_count, @lang, @embedding)
    `);

    const embedding = tweet.embedding
      ? Buffer.from(new Float32Array(tweet.embedding).buffer)
      : null;

    stmt.run({
      ...tweet,
      embedding,
    });
  }

  getTweetById(id: string): Tweet | null {
    const stmt = this.db.prepare("SELECT * FROM tweets WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      ...row,
      embedding: row.embedding
        ? Array.from(new Float32Array(row.embedding.buffer))
        : undefined,
    };
  }

  searchByText(query: string, limit = 20): Tweet[] {
    const stmt = this.db.prepare(`
      SELECT t.* FROM tweets t
      JOIN tweets_fts ON t.rowid = tweets_fts.rowid
      WHERE tweets_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);

    const rows = stmt.all(query, limit) as any[];

    return rows.map((row) => ({
      ...row,
      embedding: row.embedding
        ? Array.from(new Float32Array(row.embedding.buffer))
        : undefined,
    }));
  }

  getAllTweetsWithEmbeddings(limit = 1000): Tweet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tweets 
      WHERE embedding IS NOT NULL
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];

    return rows.map((row) => ({
      ...row,
      embedding: Array.from(new Float32Array(row.embedding.buffer)),
    }));
  }

  close() {
    this.db.close();
  }
}
