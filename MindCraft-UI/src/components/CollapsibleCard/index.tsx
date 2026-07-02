import React, { useState, type ReactNode } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import classes from './CollapsibleCard.module.css';
import { ChevronDownIcon } from 'lucide-react';

interface CollapsibleCardProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleCard = ({
  title,
  children,
  defaultOpen = false,
}: CollapsibleCardProps): React.ReactElement => {
  const [opened, setOpened] = useState(defaultOpen);

  return (
    <Box className={classes.card}>
      <Flex
        justify="space-between"
        align="center"
        gap="sm"
        className={classes.header}
        onClick={() => setOpened((o) => !o)}
      >
        {typeof title === 'string' ? <Text fw={500}>{title}</Text> : title}
        <ChevronDownIcon
          size={18}
          className={`${classes.chevron} ${opened ? classes.opened : ''}`}
        />
      </Flex>

      {/* Panel */}
      <Box className={`${classes.panel} ${opened ? classes.panelOpened : ''}`}>
        {children}
      </Box>
    </Box>
  );
};
