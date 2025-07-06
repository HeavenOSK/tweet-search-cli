import { Spinner } from "@inkjs/ui";
import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { TweetDatabase } from "../database/index.js";
import type { Tweet } from "../database/schema.js";
import { EmbeddingService } from "../services/embedding.js";
import { parseTweetsFile } from "../utils/tweet-parser.js";

interface RegisterProps {
  filePath: string;
  skipEmbedding?: boolean;
}

export const Register = ({
  filePath,
  skipEmbedding = false,
}: RegisterProps) => {
  const [status, setStatus] = useState("Parsing tweets file...");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const run = async () => {
      const db = new TweetDatabase();
      const embeddingService = skipEmbedding ? null : new EmbeddingService();

      try {
        // Parse tweets file
        const tweets = parseTweetsFile(filePath);
        setProgress({ current: 0, total: tweets.length });
        setStatus("Processing tweets...");

        // Process tweets in batches
        const batchSize = 10;
        for (let i = 0; i < tweets.length; i += batchSize) {
          const batch = tweets.slice(i, Math.min(i + batchSize, tweets.length));

          // Check which tweets already exist
          const newTweets: Tweet[] = [];
          for (const tweet of batch) {
            const existing = db.getTweetById(tweet.id);
            if (!existing) {
              newTweets.push(tweet);
            }
          }

          if (newTweets.length > 0) {
            // Generate embeddings if enabled
            if (embeddingService) {
              setStatus(
                `Generating embeddings for ${newTweets.length} new tweets...`,
              );
              const texts = newTweets.map((t) => t.full_text);
              const embeddings =
                await embeddingService.generateEmbeddings(texts);

              for (let j = 0; j < newTweets.length; j++) {
                newTweets[j].embedding = embeddings[j];
              }
            }

            // Insert tweets
            for (const tweet of newTweets) {
              db.insertTweet(tweet);
            }
          }

          setProgress({ current: i + batch.length, total: tweets.length });
        }

        setStatus("Registration completed!");
        setCompleted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        db.close();
      }
    };

    run();
  }, [filePath, skipEmbedding]);

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (completed) {
    return (
      <Box flexDirection="column">
        <Text color="green">✓ {status}</Text>
        <Text>Processed {progress.current} tweets</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Spinner type="dots" />
        <Text> {status}</Text>
      </Box>
      {progress.total > 0 && (
        <Text>
          Progress: {progress.current}/{progress.total} tweets
        </Text>
      )}
    </Box>
  );
};
