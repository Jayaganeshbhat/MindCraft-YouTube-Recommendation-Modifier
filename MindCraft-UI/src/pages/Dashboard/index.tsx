import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Group, Stack, Title, Text, Box } from '@mantine/core';
import { useLearningPaths } from '../../hooks/learningPaths/useLearningPaths';

import styles from './Dashboard.module.css';
import { StyledButton } from '../../components/StyledButton';
import { capitalize } from '../../utils/common';
import { Chip } from '../../components/Chip';

export const Dashboard = (): React.ReactElement => {
  const { isLoading, isError, data: paths, refetch } = useLearningPaths();

  const NoPaths = (): React.ReactElement => {
    return (
      <Stack
        p={32}
        justify="center"
        align="center"
        w="100%"
        bg="dark.9"
        bdrs="md"
        gap="xl"
        bd="1px solid gray.8"
      >
        <img
          src="/images/undraw_stepping-up_4q3b.svg"
          alt="Step up"
          className={styles.stepUpImg}
        />
        <Stack gap="sm" w="100%" justify="center" align="center">
          <Text size="lg">Every great journey starts with a single step.</Text>
          <Text size="lg">
            Create your first learning path and start mastering something new.
          </Text>
        </Stack>
        <Link to="/app/create-path">
          <StyledButton size="lg" w="100%">
            Create New Path
          </StyledButton>
        </Link>
      </Stack>
    );
  };

  const LearningPaths = (): React.ReactElement => {
    return (
      <Flex wrap="wrap" gap="md" w="100%" pt={12} pb={32}>
        {paths?.map((path) => {
          const createdLabel = new Date(path.createdAt).toLocaleDateString();
          return (
            <Box key={path.id} w={{ base: '100%', md: 'auto' }}>
              <Link
                to={`/app/paths/${path.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  width: 'inherit',
                }}
              >
                <Stack gap="md" p={24} bg="dark.9" bdrs="md">
                  <Flex
                    justify="space-between"
                    align="flex-start"
                    gap="xs"
                    w="100%"
                  >
                    <Stack gap={2}>
                      <Title order={3} size="h4">
                        {path.name}
                      </Title>
                      <Text c="dimmed" size="sm">
                        Created on: {createdLabel}
                      </Text>
                    </Stack>
                  </Flex>
                  <Flex gap="xs">
                    <Chip text={`${capitalize(path.type)} Based`} />
                    <Chip text={path.roleOrSkill} />
                  </Flex>
                  <Text size="sm" c="dimmed">
                    {`${capitalize(path.level)} • ${path.finishIn || 0} ${path.finishUnit || ''} • ${path.minutesPerDay || 0} minutes daily`}
                  </Text>
                </Stack>
              </Link>
            </Box>
          );
        })}
      </Flex>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading your learning paths...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-red-500">
          Something went wrong while loading your learning paths.
        </p>
        {refetch && (
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300 hover:bg-gray-50 transition"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <Group>
      <Group w="100%">
        <Stack px={32} w="100%" gap="sm">
          <Flex justify="space-between" align="center">
            <Title order={2} size="h4">
              Your Learning Path
            </Title>
            {paths && paths.length ? (
              <Link to="/app/create-path">
                <StyledButton size="xs">New Path</StyledButton>
              </Link>
            ): null}
          </Flex>
          {!paths || !paths.length ? <NoPaths /> : <LearningPaths />}
        </Stack>
      </Group>
    </Group>
  );
};
