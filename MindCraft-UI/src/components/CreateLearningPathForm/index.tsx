import React, { useState } from 'react';
import {
  Box,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { StyledButton } from '../StyledButton';

import type {
  CurrentLevel,
  DurationUnit,
  LearningPace,
  PathType,
} from '../../types/learningPath';
import { XIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useLearningPaths } from '../../hooks/learningPaths/useLearningPaths';
import { notifications } from '@mantine/notifications';
import { ROLE_OPTIONS } from './roles';
import { SKILL_OPTIONS } from './skills';
import { useMediaQuery } from '@mantine/hooks';

export const CreateLearningPathForm = (): React.ReactElement => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { refetch } = useLearningPaths();

  const navigate = useNavigate();

  const [pathType, setPathType] = useState<PathType>('role');

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      pathType: 'role' as PathType,
      selectedRoleOrSkill: null as string | null,
      currentLevel: 'beginner' as CurrentLevel,
      pace: 'daily-15' as LearningPace,
      finishIn: 1,
      finishUnit: 'weeks' as DurationUnit,
    },
    validate: {
      name: (v) => (v.trim().length < 3 ? 'Give your path a short name' : null),
      selectedRoleOrSkill: (v) => (!v ? 'Please choose one' : null),
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    const payload = {
      ...values,
    };

    setIsLoading(true);
    try {
      const res = await axios.post('/api/paths', payload, {
        withCredentials: true,
      });

      refetch();
      const pathId = res?.data?._id;
      if (pathId) navigate(`/app/paths/${pathId}`);
    } catch (err) {
      console.error('Error:', err);
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        notifications.show({
          title: err?.response?.data?.error || 'Failed to create learning path',
          message:
            err?.response?.data?.message || err?.message || 'Unknown error',
          color: 'red',
          position: 'top-right',
        });
      } else {
        notifications.show({
          title: 'Failed to create learning path',
          color: 'red',
          message: 'Unknown error',
          position: 'top-right',
        });
      }
    }
  });

  if (isLoading) {
    return (
      <Stack
        justify="center"
        align="center"
        h="600px"
        w="100%"
        m="0 auto"
        p={32}
        gap={0}
      >
        <Box h="300px">
          <DotLottieReact src="/lottie/AI-logo-Foriday.lottie" loop autoplay />
        </Box>
        <Stack gap="sm" align="center">
          <Text fw={500} size="lg">
            Creating your learning path
          </Text>
          <Text size="sm" c="dimmed">
            This may take a few seconds
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Paper
      shadow="md"
      radius="lg"
      p={{ base: 12, sm: 32 }}
      m="0 auto"
      w={{ base: '-webkit-fill-available', sm: 800 }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={3}>Create a Learning Path</Title>
          <Link to="/app">
            <XIcon size={24} />
          </Link>
        </Group>

        <TextInput
          label="Path name"
          placeholder="e.g., React Sprint 🚀"
          description="Give it a short, motivating name"
          required
          {...form.getInputProps('name')}
        />

        <Stack gap={2}>
          <Text fw={500} size="sm">
            What are you aiming for?
          </Text>
          <SegmentedControl
            onChange={(v: string) => {
              setPathType(v as PathType);
              form.setFieldValue('pathType', v as PathType);
              form.setFieldValue('selectedRoleOrSkill', null);
            }}
            fullWidth
            data={[
              {
                label: 'For a Role (e.g., Frontend Developer)',
                value: 'role',
              },
              {
                label: 'A Skill (e.g., React, Data Analysis)',
                value: 'skill',
              },
            ]}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          />
        </Stack>

        <Select
          label={
            pathType === 'role'
              ? 'What role are you preparing for?'
              : 'What skill do you want to learn?'
          }
          placeholder={
            pathType === 'role' ? 'Search roles...' : 'Search skills…'
          }
          searchable
          data={pathType === 'role' ? ROLE_OPTIONS : SKILL_OPTIONS}
          nothingFoundMessage="No matches"
          {...form.getInputProps('selectedRoleOrSkill')}
        />
      </Stack>

      <Divider label="Your experience" labelPosition="center" my="lg" />
      <Stack gap={4}>
        <Text fw={500} size="sm">
          What’s your current level?
        </Text>
        <SegmentedControl
          fullWidth
          data={[
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ]}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          {...form.getInputProps('currentLevel')}
        />
      </Stack>

      <Divider label="Your target" labelPosition="center" my="lg" />
      <Stack gap="lg">
        <Stack gap={4}>
          <Text fw={500} size="sm">
            When do you want to finish?
          </Text>

          <Group align="end" grow>
            <NumberInput
              label="Finish in"
              min={1}
              max={52}
              placeholder="8"
              {...form.getInputProps('finishIn')}
            />
            <Select
              label="Unit"
              data={[
                { value: 'weeks', label: 'weeks' },
                { value: 'months', label: 'months' },
              ]}
              {...form.getInputProps('finishUnit')}
            />
          </Group>
        </Stack>
        <Stack gap={4}>
          <Text fw={500} size="sm">
            How much time do you want to give yourself?
          </Text>
          <SegmentedControl
            fullWidth
            data={[
              { label: 'Daily • 15m', value: 'daily-15' },
              { label: 'Daily • 30m', value: 'daily-30' },
              { label: 'Daily • 60m', value: 'daily-60' },
              { label: 'Weekly • 3h', value: 'weekly-3h' },
            ]}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            {...form.getInputProps('pace')}
          />
          <Text size="sm" c="dimmed">
            This sets your study rhythm. We’ll size the plan based on your
            target.
          </Text>
        </Stack>
      </Stack>

      <StyledButton w="100%" mt="xl" onClick={() => onSubmit()}>
        Create Path
      </StyledButton>
    </Paper>
  );
};
