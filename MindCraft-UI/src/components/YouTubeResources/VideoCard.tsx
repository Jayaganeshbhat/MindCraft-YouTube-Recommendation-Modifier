import React, { useState } from "react";
import axios from "axios";
import { Button, Text, Loader, Card, Image, Stack } from "@mantine/core";

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail: string;
  videoId: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  description,
  thumbnail,
  videoId,
}) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/summarize", {
        title,
        description,
      });
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setSummary("Error generating summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="md" radius="md" style={{ background: "#111" }}>
      <Card.Section>
        <Image src={thumbnail} alt={title} height={160} />
      </Card.Section>

      <Stack gap={8} mt="sm">
        <Text fw={600} size="sm">
          {title}
        </Text>

        {summary && (
          <Text size="sm" c="gray.4" style={{ fontStyle: "italic" }}>
            {summary}
          </Text>
        )}

        <Button
          size="xs"
          variant="light"
          color="green"
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? <Loader size="xs" /> : "Generate Summary"}
        </Button>
      </Stack>
    </Card>
  );
};
