import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { TweetDatabase } from "../database/index.js";
import type { Tweet } from "../database/schema.js";
import { EmbeddingService } from "../services/embedding.js";

interface SearchProps {
  query: string;
  mode: "like" | "vector";
  limit?: number;
}

interface SearchResult extends Tweet {
  similarity?: number;
}

export const Search = ({ query, mode, limit = 20 }: SearchProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      const db = new TweetDatabase();

      try {
        if (mode === "like") {
          // FTS5 full-text search
          const tweets = db.searchByText(query, limit);
          setResults(tweets);
        } else {
          // Vector similarity search
          const embeddingService = new EmbeddingService();
          const queryEmbedding =
            await embeddingService.generateEmbedding(query);

          // Get all tweets with embeddings
          const tweets = db.getAllTweetsWithEmbeddings(1000);

          // Calculate similarities
          const withSimilarity = tweets
            .map((tweet) => ({
              ...tweet,
              similarity: EmbeddingService.cosineSimilarity(
                queryEmbedding,
                tweet.embedding!,
              ),
            }))
            .sort((a, b) => b.similarity! - a.similarity!)
            .slice(0, limit);

          setResults(withSimilarity);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        db.close();
      }
    };

    search();
  }, [query, mode, limit]);

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Text>Searching...</Text>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box>
        <Text color="yellow">No results found for "{query}"</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        Found {results.length} results for "{query}" (mode: {mode})
      </Text>
      <Text> </Text>
      {results.map((tweet, index) => (
        <Box key={tweet.id} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color="cyan">{index + 1}. </Text>
            <Text color="gray">
              {new Date(tweet.created_at).toLocaleString()}
            </Text>
            {tweet.similarity && (
              <Text color="magenta">
                {" "}
                (similarity: {tweet.similarity.toFixed(3)})
              </Text>
            )}
          </Box>
          <Text>{tweet.full_text}</Text>
          <Box>
            <Text color="gray">
              ❤️ {tweet.favorite_count} 🔁 {tweet.retweet_count}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
