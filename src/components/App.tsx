import { Box, Text } from "ink";
import type { FC } from "react";

export const App: FC = () => {
  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        Tweet Search CLI
      </Text>
      <Text color="gray">Welcome to Tweet Search CLI!</Text>
    </Box>
  );
};
