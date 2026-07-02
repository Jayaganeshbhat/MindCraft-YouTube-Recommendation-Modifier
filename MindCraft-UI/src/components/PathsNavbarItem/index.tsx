import React, { useState } from 'react';
import {
  Accordion,
  ActionIcon,
  Button,
  Skeleton,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { RouteIcon, Trash2Icon } from 'lucide-react';
import { NavbarItem } from '../NavbarItem';
import { useLearningPaths } from '../../hooks/learningPaths/useLearningPaths';
import { StyledButton } from '../StyledButton';
import { Link } from 'react-router-dom';
import cx from 'clsx';

import styles from '../NavbarItem/NavbarItem.module.css';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import type { LearningPathSummary } from '../../hooks/learningPaths/types';
import { DeletePathModal } from '../DeletePathModal';

export const PathsNavbarItem = (): React.ReactElement => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { isLoading, isError, data, refetch } = useLearningPaths();
  const [opened, { open, close }] = useDisclosure(false);
  const [pathToDelete, setPathToDelete] = useState<LearningPathSummary | null>(
    null,
  );

  return (
    <>
      <Accordion defaultValue="paths">
        <Accordion.Item
          key="paths"
          value="paths"
          style={{
            border: 'none',
          }}
        >
          <Accordion.Control icon={<RouteIcon size={18} />} px="sm">
            <Text size="sm">Paths</Text>
          </Accordion.Control>
          <Accordion.Panel
            style={{
              maxHeight: 'calc(100vh - 420px)',
              overflow: 'auto',
            }}
          >
            {isLoading && (
              <Stack gap="sm">
                <Skeleton height={40} radius="md" />
                <Skeleton height={40} radius="md" />
                <Skeleton height={40} radius="md" />
                <Skeleton height={40} radius="md" />
              </Stack>
            )}
            {!isLoading && isError && (
              <Stack gap="sm" align="center">
                <Text c="red.5">Error loading paths</Text>
                <Button variant="outline" onClick={refetch} w="100%">
                  Retry
                </Button>
              </Stack>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <Stack gap="sm" align="center">
                <Text c="gray.5" size="sm">
                  No paths found
                </Text>
                <Link to="/app/create-path" style={{ width: '100%' }}>
                  <StyledButton size="xs" w="100%">
                    Create New Path
                  </StyledButton>
                </Link>
              </Stack>
            )}
            {!isLoading && !isError && data?.length ? (
              <Stack gap={4}>
                {data.map((path) => (
                  <NavbarItem
                    key={path.id}
                    to={`/app/paths/${path.id}`}
                    label={path.name}
                    expanded={true}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        size="md"
                        c="red.4"
                        className={cx(styles.trashIcon, {
                          [styles.alwaysVisible]: isMobile,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setPathToDelete(path);
                          open();
                        }}
                      >
                        <Trash2Icon size={16} />
                      </ActionIcon>
                    }
                  />
                ))}
              </Stack>
            ) : null}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <DeletePathModal
        opened={opened}
        close={close}
        pathToDelete={pathToDelete}
        refetch={refetch}
      />
    </>
  );
};
