import React, { useCallback, useMemo, useState } from 'react';
import { Box, Stack, Title, Text, Table, Alert, Group, Button, Loader, Divider, Switch } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import dayjs from 'dayjs';
import axios from 'axios';
import { AlertCircleIcon, CheckIcon, UploadIcon } from 'lucide-react';
import { BarChart, AreaChart } from '@mantine/charts';

type ProcessedHistoryItem = {
  title: string;
  url?: string;
  channel: string;
  watchedAt: string; // ISO
};

export const WatchHistory = (): React.ReactElement => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProcessedHistoryItem[]>([]);
  const [excludeUnknown, setExcludeUnknown] = useState(true);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setError(null);
      setUploading(true);
      try {
        const text = await files[0].text();
        const parsed = JSON.parse(text);
        const payload = Array.isArray(parsed) ? parsed : parsed?.items;
        if (!Array.isArray(payload)) {
          throw new Error('Invalid JSON. Expected an array or { items: [] }.');
        }
        const resp = await axios.post(
          `/api/watch-history/process`,
          { items: payload },
          { withCredentials: true },
        );
        if (resp.data?.success) {
          setItems(resp.data.data || []);
        } else {
          throw new Error(resp.data?.message || 'Failed to process watch history');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to process file');
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const hasItems = useMemo(() => items && items.length > 0, [items]);

  const filtered = useMemo(
    () => (excludeUnknown ? items.filter((i) => i.channel && i.channel !== 'Unknown') : items),
    [items, excludeUnknown],
  );

  const topChannels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of filtered) {
      counts.set(it.channel, (counts.get(it.channel) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([channel, value]) => ({ channel, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const byDayOfWeek = useMemo(() => {
    const map = new Map<number, number>(); // 0..6
    for (const it of filtered) {
      const d = dayjs(it.watchedAt);
      const dow = d.day(); // 0 Sunday .. 6 Saturday
      map.set(dow, (map.get(dow) || 0) + 1);
    }
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return labels.map((label, idx) => ({ day: label, value: map.get(idx) || 0 }));
  }, [filtered]);

  const byHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: `${h.toString().padStart(2, '0')}:00`, value: 0 }));
    for (const it of filtered) {
      const d = dayjs(it.watchedAt);
      const h = d.hour();
      arr[h].value += 1;
    }
    return arr;
  }, [filtered]);

  const dailyTimeline = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of filtered) {
      const key = dayjs(it.watchedAt).format('YYYY-MM-DD');
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [filtered]);

  return (
    <Stack px={32} w="100%" gap="md">
      <Title order={2} size="h4">
        Watch History
      </Title>

      <Dropzone
        onDrop={onDrop}
        onReject={() => setError('Please upload a valid JSON file.')}
        maxFiles={1}
        accept={[MIME_TYPES.json]}
        multiple={false}
        disabled={uploading}
        style={{
          borderRadius: 12,
        }}
      >
        <Group justify="center" gap="sm" mih={140}>
          {uploading ? (
            <>
              <Loader size="sm" />
              <Text>Processing your watch history…</Text>
            </>
          ) : (
            <>
              <UploadIcon size={18} />
              <Text>Drop your watch history JSON here, or click to select</Text>
            </>
          )}
        </Group>
      </Dropzone>

      {error && (
        <Alert color="red" icon={<AlertCircleIcon size={16} />} radius="md">
          {error}
        </Alert>
      )}

      {hasItems && (
        <Box>
          <Group justify="space-between" mb="sm">
            <Text c="dimmed" size="sm">
              {items.length} entries
            </Text>
            <Button
              variant="light"
              size="xs"
              leftSection={<CheckIcon size={14} />}
              onClick={() => setItems([])}
            >
              Clear
            </Button>
          </Group>

          <Group justify="space-between" align="center" mb="xs">
            <Title order={3} size="h5">Insights</Title>
            <Group gap="sm">
              <Switch
                size="xs"
                checked={excludeUnknown}
                onChange={(e) => setExcludeUnknown(e.currentTarget.checked)}
                label="Exclude Unknown channels"
              />
            </Group>
          </Group>

          <Group grow wrap="wrap" gap="md">
            <Box p="sm" bg="dark.9" style={{ borderRadius: 12, border: '1px solid var(--mantine-color-dark-5)' }}>
              <Text size="sm" mb="xs">Top channels</Text>
              <BarChart
                h={260}
                data={topChannels.map((x) => ({ name: x.channel, Views: x.value }))}
                dataKey="name"
                barProps={{ radius: 6 }}
                series={[{ name: 'Views', color: 'blue.5' }]}
                withLegend={false}
                tickLine="x"
              />
            </Box>

            <Box p="sm" bg="dark.9" style={{ borderRadius: 12, border: '1px solid var(--mantine-color-dark-5)' }}>
              <Text size="sm" mb="xs">By day of week</Text>
              <BarChart
                h={260}
                data={byDayOfWeek.map((x) => ({ name: x.day, Views: x.value }))}
                dataKey="name"
                barProps={{ radius: 6 }}
                series={[{ name: 'Views', color: 'teal.5' }]}
                withLegend={false}
                tickLine="x"
              />
            </Box>
          </Group>

          <Group grow wrap="wrap" gap="md" mt="md">
            <Box p="sm" bg="dark.9" style={{ borderRadius: 12, border: '1px solid var(--mantine-color-dark-5)' }}>
              <Text size="sm" mb="xs">By hour of day</Text>
              <BarChart
                h={260}
                data={byHour.map((x) => ({ name: x.hour, Views: x.value }))}
                dataKey="name"
                barProps={{ radius: 6 }}
                series={[{ name: 'Views', color: 'grape.5' }]}
                withLegend={false}
                tickLine="x"
              />
            </Box>

            <Box p="sm" bg="dark.9" style={{ borderRadius: 12, border: '1px solid var(--mantine-color-dark-5)' }}>
              <Text size="sm" mb="xs">Daily timeline</Text>
              <AreaChart
                h={260}
                data={dailyTimeline.map((x) => ({ date: x.date, Views: x.value }))}
                dataKey="date"
                series={[{ name: 'Views', color: 'cyan.5' }]}
                curveType="linear"
                withLegend={false}
              />
            </Box>
          </Group>

          <Divider my="md" />

          <Table striped stickyHeader stickyHeaderOffset={60} withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Watched At</Table.Th>
                <Table.Th>Channel</Table.Th>
                <Table.Th>Title</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((it, idx) => (
                <Table.Tr key={`${it.watchedAt}-${idx}`}>
                  <Table.Td>{dayjs(it.watchedAt).format('YYYY-MM-DD HH:mm')}</Table.Td>
                  <Table.Td>{it.channel}</Table.Td>
                  <Table.Td>
                    {it.url ? (
                      <a href={it.url} target="_blank" rel="noreferrer">
                        {it.title}
                      </a>
                    ) : (
                      it.title
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
};

export default WatchHistory;


