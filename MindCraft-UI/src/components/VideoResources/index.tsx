import { useState } from "react";
import { Card, Image, Text, Title, Grid, Stack } from "@mantine/core";

interface Video {
  title: string;
  url: string;
  source: string;
  thumbnailUrl?: string;
}

interface Resource {
  topic: string;
  videos: Video[];
}

interface VideosJson {
  resources: Resource[];
}

interface VideoResourcesProps {
  videosJson: VideosJson;
}

// Helper to get fallback image based on source
function getFallbackImage(source: string) {
  switch (source?.toLowerCase()) {
    case "udemy":
      return "/images/udemy.svg";
    case "coursera":
      return "/images/coursera.svg";
    case "youtube":
      return "/images/youtube.png";
    default:
      return "/images/default.png";
  }
}

export function VideoResources({ videosJson }: VideoResourcesProps) {
  if (!videosJson?.resources?.length) {
    return <Text>No video resources available.</Text>;
  }

  return (
    <Stack gap="xl">
      {videosJson.resources.map((resource, i) => (
        <Stack key={i}>
          <Title order={3}>{resource.topic}</Title>
          <Grid>
            {resource.videos.map((video, j) => (
              <Grid.Col key={j} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <VideoCard video={video} />
                </a>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
}

// Extracted VideoCard with image fallback logic
function VideoCard({ video }: { video: Video }) {
  const [imgSrc, setImgSrc] = useState(video.thumbnailUrl || getFallbackImage(video.source));

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      style={{
        height: "100%",
        transition: "transform 0.15s ease",
      }}
      className="hover:scale-[1.02]"
    >
      <Card.Section>
        <Image
          src={imgSrc}
          alt={video.title}
          height={160}
          fit="cover"
          onError={() => setImgSrc(getFallbackImage(video.source))}
        />
      </Card.Section>

      <Stack gap={4} mt="sm">
        <Text fw={500} lineClamp={2}>
          {video.title}
        </Text>
        <Text size="sm" c="dimmed">
          {video.source}
        </Text>
      </Stack>
    </Card>
  );
}
