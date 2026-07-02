import React from 'react';
import type { User } from '../../types/user';
import { Avatar, Flex, Stack, Text, Tooltip } from '@mantine/core';

interface UserInfoNavSectionProps {
  expanded: boolean;
  user: User;
}

export const UserInfoNavSection = ({
  expanded,
  user,
}: UserInfoNavSectionProps): React.ReactElement => {
  const UserAvatar = (): React.ReactElement => (
    <Avatar
      src={user?.photo}
      alt={user?.name || 'Profile'}
      size="md"
      imageProps={{
        referrerPolicy: 'no-referrer',
        loading: 'lazy',
        decoding: 'async',
        crossOrigin: 'anonymous',
      }}
    />
  );

  if (expanded) {
    return (
      <Flex gap="xs" align="center" mt="lg">
        <UserAvatar />
        <Stack gap={0}>
          <Text mb={2}>{user?.name}</Text>
          <Text size="xs" c="gray.5">
            {user?.email}
          </Text>
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex justify="center" mt="lg">
      <Tooltip
        label={
          <Stack gap={0}>
            <Text mb={2}>{user?.name}</Text>
            <Text size="xs" c="gray.8">
              {user?.email}
            </Text>
          </Stack>
        }
        position="right"
        withArrow
      >
        <UserAvatar />
      </Tooltip>
    </Flex>
  );
};
