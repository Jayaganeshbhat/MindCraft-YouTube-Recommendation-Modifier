import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import axios from 'axios';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './Path.module.css';
import { GoalIcon, ListVideoIcon, TvMinimalPlayIcon } from 'lucide-react';
import { OnlineResources } from '../../components/OnlineResources';
import { Chip } from '../../components/Chip';
import { capitalize } from '../../utils/common';
import { CollapsibleCard } from '../../components/CollapsibleCard';
import { YouTubeResources } from '../../components/YouTubeResources';

export const Path = (): React.ReactElement => {
  const { pathId } = useParams<{ pathId: string }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [path, setPath] = useState<any>(null);

  useEffect(() => {
    // async inside useEffect must be wrapped in a function
    const fetchPath = async () => {
      if (!pathId) return;
      try {
        const res = await axios.get(`/api/paths/${pathId}`, {
          withCredentials: true,
        });
        setPath(res.data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(
          'Failed to fetch path:',
          err.response?.data || err.message,
        );
      }
    };
    fetchPath();
  }, [pathId]);

  return (
    <Group>
      <Stack px={{ base: 0, sm: 32 }} pb="xl" w="100%">
        {path ? (
          <>
            <CollapsibleCard
              title={
                <Title order={1} size="h3">
                  {path.name}
                </Title>
              }
            >
              <Stack gap="sm">
                <Stack gap={0}>
                  <Text c="dimmed" size="sm">
                    Created on: {new Date(path.createdAt).toLocaleDateString()}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {`${capitalize(path.currentLevel)} • ${path.finishIn || 0} ${path.finishUnit || ''} • ${path.minutesPerDay || 0} minutes daily`}
                  </Text>
                </Stack>
                <Flex gap="xs">
                  <Chip text={`${capitalize(path.pathType)} Based`} />
                  <Chip text={path.selectedRoleOrSkill} />
                </Flex>
              </Stack>
            </CollapsibleCard>
            <Tabs color="violet.6" defaultValue="markdown">
              <Tabs.List>
                <Tabs.Tab value="markdown" leftSection={<GoalIcon size={16} />}>
                  Learning Plan
                </Tabs.Tab>
                <Tabs.Tab
                  value="online-resources"
                  leftSection={<ListVideoIcon size={16} />}
                >
                  Online Resources
                </Tabs.Tab>
                <Tabs.Tab
                  value="youtube-resources"
                  leftSection={<TvMinimalPlayIcon size={16} />}
                >
                  YouTube Resources
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="markdown">
                <Box
                  className={styles.markdown}
                  bg="dark.9"
                  px={32}
                  py={4}
                  w="100%"
                  bdrs="lg"
                  mt="xl"
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {path.planMarkdown}
                  </Markdown>
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="online-resources">
                <Box mt="xl">
                  <OnlineResources resources={path.onlineResources} />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="youtube-resources">
                <Box mt="xl">
                  <YouTubeResources
                    youtubeResources={path.youtubeResources}
                  />
                </Box>
              </Tabs.Panel>
            </Tabs>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Stack>
    </Group>
  );
};
