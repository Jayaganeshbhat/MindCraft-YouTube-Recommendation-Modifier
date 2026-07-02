import type { ButtonProps } from '@mantine/core';

import React from 'react';
import { Button } from '@mantine/core';
import styles from './styledButton.module.css';

type StyledButtonProps = ButtonProps & React.ComponentPropsWithoutRef<'button'>;

export const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref as React.Ref<HTMLButtonElement>}
      {...props}
      className={[styles.styledButton, className].filter(Boolean).join(' ')}
    />
  )
);
StyledButton.displayName = 'StyledButton';
