import { useState } from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { LearningPathSummary } from '../../hooks/learningPaths/types';

type DeletePathModalProps = {
  opened: boolean;
  close: () => void;
  pathToDelete: LearningPathSummary | null;
  refetch: () => void | Promise<void>;
};

export function DeletePathModal({
  opened,
  close,
  pathToDelete,
  refetch,
}: DeletePathModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pathToDelete?.id || isDeleting) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/paths/${pathToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!res.ok || data?.success === false) {
        notifications.show({
          title: 'Failed to delete learning path',
          color: 'red',
          message: data?.message || 'Unknown error',
        });
        return;
      }

      await Promise.resolve(refetch());
      close();
    } catch (err) {
      console.error('Error deleting path:', err);
      notifications.show({
        title: 'Failed to delete learning path',
        color: 'red',
        message: 'Unknown error',
        position: 'top-right',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={isDeleting ? () => {} : close}
      title="Delete Path"
      closeOnClickOutside={!isDeleting}
      closeOnEscape={!isDeleting}
      withCloseButton={!isDeleting}
    >
      <Text span>This will delete&nbsp;</Text>
      <Text span fw={500} c="red.6">
        {pathToDelete?.name || 'Path'}
      </Text>

      <Group mt="lg" justify="flex-end">
        <Button onClick={close} variant="default" disabled={isDeleting}>
          Cancel
        </Button>

        <Button
          onClick={handleDelete}
          color="red"
          loading={isDeleting}
          disabled={!pathToDelete?.id}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
