#!/usr/bin/env tsx
import { Command } from "commander";
import { render } from "ink";
import { Register } from "./commands/register.js";
import { Search } from "./commands/search.js";

const program = new Command();

program
  .name("tweet-search")
  .description("CLI tool for managing and searching tweets")
  .version("1.0.0");

program
  .command("register")
  .description("Register tweets from archive file")
  .argument("<file>", "Path to tweets.js file")
  .option("--skip-embedding", "Skip generating embeddings")
  .action(async (file, options) => {
    const { waitUntilExit } = render(
      <Register filePath={file} skipEmbedding={options.skipEmbedding} />,
    );
    await waitUntilExit();
    process.exit(0);
  });

program
  .command("search")
  .description("Search tweets")
  .argument("<query>", "Search query")
  .option("-m, --mode <mode>", "Search mode (like|vector)", "like")
  .option("-l, --limit <number>", "Number of results", "20")
  .action(async (query, options) => {
    const limit = Number.parseInt(options.limit, 10);
    const { waitUntilExit } = render(
      <Search query={query} mode={options.mode} limit={limit} />,
    );
    await waitUntilExit();
    process.exit(0);
  });

program.parse();
