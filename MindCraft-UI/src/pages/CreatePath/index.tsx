import React from 'react';
import { Group } from '@mantine/core';
import { CreateLearningPathForm } from '../../components/CreateLearningPathForm';

export const CreatePath = (): React.ReactElement => {
  return (
    <Group>
      <CreateLearningPathForm />
    </Group>
  );
};
