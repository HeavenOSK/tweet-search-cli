import { readFileSync } from "node:fs";
import type { Tweet } from "../database/schema.js";

interface RawTweet {
  tweet: {
    id_str: string;
    created_at: string;
    full_text: string;
    favorite_count: string;
    retweet_count: string;
    lang: string;
  };
}

export function parseTweetsFile(filePath: string): Tweet[] {
  const content = readFileSync(filePath, "utf-8");

  // Extract the JSON array from the JavaScript file
  const jsonMatch = content.match(
    /window\.YTD\.tweets\.part\d+\s*=\s*(\[[\s\S]*\])/,
  );
  if (!jsonMatch) {
    throw new Error("Could not find tweet data in the file");
  }

  try {
    const rawTweets: RawTweet[] = JSON.parse(jsonMatch[1]);

    return rawTweets.map((raw) => ({
      id: raw.tweet.id_str,
      created_at: raw.tweet.created_at,
      full_text: raw.tweet.full_text,
      favorite_count: Number.parseInt(raw.tweet.favorite_count, 10) || 0,
      retweet_count: Number.parseInt(raw.tweet.retweet_count, 10) || 0,
      lang: raw.tweet.lang,
    }));
  } catch (error) {
    throw new Error(`Failed to parse tweets: ${error}`);
  }
}
