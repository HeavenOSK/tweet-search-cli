export interface Tweet {
  id: string;
  created_at: string;
  full_text: string;
  favorite_count: number;
  retweet_count: number;
  lang: string;
  embedding?: number[];
}

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tweets (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_text TEXT NOT NULL,
    favorite_count INTEGER DEFAULT 0,
    retweet_count INTEGER DEFAULT 0,
    lang TEXT,
    embedding BLOB,
    indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
  CREATE INDEX IF NOT EXISTS idx_tweets_lang ON tweets(lang);
  CREATE VIRTUAL TABLE IF NOT EXISTS tweets_fts USING fts5(
    full_text,
    content=tweets,
    content_rowid=rowid
  );
  
  CREATE TRIGGER IF NOT EXISTS tweets_fts_insert AFTER INSERT ON tweets
  BEGIN
    INSERT INTO tweets_fts(rowid, full_text) VALUES (new.rowid, new.full_text);
  END;
  
  CREATE TRIGGER IF NOT EXISTS tweets_fts_update AFTER UPDATE ON tweets
  BEGIN
    UPDATE tweets_fts SET full_text = new.full_text WHERE rowid = new.rowid;
  END;
  
  CREATE TRIGGER IF NOT EXISTS tweets_fts_delete AFTER DELETE ON tweets
  BEGIN
    DELETE FROM tweets_fts WHERE rowid = old.rowid;
  END;
`;
