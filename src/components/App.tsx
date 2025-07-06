import { Box, Text } from "ink";
import React from "react";

export const App: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        Tweet Search CLI
      </Text>
      <Text color="gray">Welcome to Tweet Search CLI!</Text>
    </Box>
  );
};
