import { Stack, Image, Title, Text, Card, SimpleGrid } from '@mantine/core';
import styles from './YouTubeResources.module.css';

type Thumbnail = {
  url: string;
  width: number;
  height: number;
};

type ThumbnailSize = {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
};

type Snippet = {
  publishedAt: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnails: ThumbnailSize;
};

type YoutubeResourcesResponse = {
  query: string;
  resources: {
    id: { videoId: string };
    snippet: Snippet;
  }[];
}[];

type YouTubeResourcesProps = {
  youtubeResources: YoutubeResourcesResponse | null | undefined;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function getThumb(snippet: Snippet) {
  return (
    snippet.thumbnails.high?.url ||
    snippet.thumbnails.medium?.url ||
    snippet.thumbnails.default?.url ||
    ''
  );
}

export const YouTubeResources = ({
  youtubeResources,
}: YouTubeResourcesProps) => {
  return (
    <Stack gap="xl">
      {youtubeResources?.map((resource) => (
        <Stack key={resource.query} gap="md">
          <Title order={3}>{resource.query}</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {resource.resources.map((resource) => (
              <Card
                key={resource.id.videoId}
                withBorder
                radius="md"
                shadow="sm"
                bg="none"
                bd="none"
                p="sm"
                className={styles.youtubeCard}
                onClick={() => {
                  window
                    .open(
                      `https://www.youtube.com/watch?v=${resource.id.videoId}`,
                      '_blank',
                    )
                    ?.focus();
                }}
              >
                <Card.Section bdrs="md">
                  <Image
                    src={getThumb(resource.snippet)}
                    alt={resource.snippet.title}
                    fit="cover"
                    height={160}
                    bdrs="md"
                  />
                </Card.Section>
                <Stack gap={4} mt="sm">
                  <Text fw={500} lineClamp={2}>
                    {resource.snippet.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {resource.snippet.description}
                  </Text>
                  <Text size="sm" c="gray.6">
                    {resource.snippet.channelTitle} •{' '}
                    {formatDate(resource.snippet.publishedAt)}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  );
};
