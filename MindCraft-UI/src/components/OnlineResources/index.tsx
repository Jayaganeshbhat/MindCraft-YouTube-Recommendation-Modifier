import { useState } from 'react';
import { Card, Image, Text, Title, Grid, Stack, Flex } from '@mantine/core';

type ResourceType = 'video' | 'article';

interface ResourceItem {
  title: string;
  url: string;
  source: string;
  thumbnailUrl?: string;
  type: ResourceType;
}

interface Resource {
  topic: string;
  contents: ResourceItem[];
}

interface OnlineResourcesProps {
  resources: Resource[];
}

// Helper to get fallback image based on source
function getFallbackImage(source: string): string {
  switch (source?.toLowerCase()) {
    case 'udemy':
      return '/images/udemy.svg';
    case 'coursera':
      return '/images/coursera.svg';
    case 'youtube':
      return '/images/youtube.png';
    default:
      return '/images/default.png';
  }
}

export function OnlineResources({ resources }: OnlineResourcesProps) {
  if (!resources?.length) {
    return <Text>No video resources available.</Text>;
  }

  return (
    <Stack gap="xl">
      {resources.map((resource, i) => (
        <Stack key={i}>
          <Title order={3}>{resource.topic}</Title>
          <Grid>
            {resource.contents.map((content, j) => (
              <Grid.Col key={j} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <ResourceCard content={content} />
                </a>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
}

function ResourceCard({ content }: { content: ResourceItem }) {
  const [imgSrc, setImgSrc] = useState(
    content.thumbnailUrl || getFallbackImage(content.source),
  );

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      style={{
        height: '100%',
        transition: 'transform 0.15s ease',
      }}
      className="hover:scale-[1.02]"
    >
      <Card.Section>
        {content.type === 'video' ? (
          <Image
            src={imgSrc}
            alt={content.title}
            height={160}
            fit="cover"
            onError={() => setImgSrc(getFallbackImage(content.source))}
            style={{
              objectFit: 'cover',
              borderRadius: 'md',
            }}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
          />
        ) : (
          <Flex h={160} bg="white" align="center" px="md">
            <Image height={100} src="/images/article.png" fit="contain" />
            <Text size="md" fw="bold" c="dark.6">{content.title}</Text>
          </Flex>
        )}
      </Card.Section>

      <Stack gap={4} mt="sm">
        <Text fw={500} lineClamp={2}>
          {content.title}
        </Text>
        <Text size="sm" c="dimmed">
          {content.source}
        </Text>
      </Stack>
    </Card>
  );
}
