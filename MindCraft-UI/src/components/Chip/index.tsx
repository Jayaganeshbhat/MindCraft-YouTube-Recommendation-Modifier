import React from 'react';
import { alpha, Box } from '@mantine/core';

interface ChipProps {
  text: string;
}

export const Chip = ({ text }: ChipProps): React.ReactElement => {
  return (
    <Box
      bg={alpha('var(--mantine-color-violet-3)', 0.1)}
      bdrs="50"
      px={16}
      py={2}
      bd="1px solid violet.3"
      c="violet.3"
    >
      {text}
    </Box>
  );
};
