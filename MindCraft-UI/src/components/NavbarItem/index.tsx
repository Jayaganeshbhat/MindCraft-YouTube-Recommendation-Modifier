import React from 'react';
import { Flex, NavLink, Tooltip } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import cx from 'clsx';
import styles from './NavbarItem.module.css';

type NavbarItemProps = {
  to?: string;
  label: string;
  icon?: React.ReactNode;
  expanded: boolean;
  danger?: boolean;
  onClick?: () => void;
  rightSection?: React.ReactNode;
};

export const NavbarItem = ({
  to = '#',
  label,
  icon,
  expanded,
  danger = false,
  onClick = () => {},
  rightSection = <></>,
}: NavbarItemProps): React.ReactElement => {
  const location = useLocation();

  const active =
    location.pathname === to ||
    (to !== '/app' && location.pathname.startsWith(to));

  if (expanded) {
    return (
      <NavLink
        component={Link}
        to={to}
        label={label}
        leftSection={icon}
        active={active}
        onClick={onClick}
        variant="light"
        bdrs="md"
        className={cx(styles.navLink, {
          [styles.active]: active,
          [styles.danger]: danger,
          [styles.dangerActive]: danger && active,
        })}
        rightSection={rightSection}
      />
    );
  }

  return (
    <Tooltip label={label} position="right" withArrow>
      <Flex
        component={Link}
        to={to}
        align="center"
        justify="center"
        p="sm"
        className={cx(styles.navIcon, {
          [styles.activeIcon]: active,
          [styles.danger]: danger,
          [styles.dangerActive]: danger && active,
        })}
      >
        {icon}
      </Flex>
    </Tooltip>
  );
};
