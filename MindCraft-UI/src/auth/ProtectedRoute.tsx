import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';
import { AppShell, Burger, Flex, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from '../components/Logo';

import {
  LayoutDashboardIcon,
  HistoryIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
} from 'lucide-react';
import React from 'react';
import { UserInfoNavSection } from '../components/UserInfoNavSection';
import { NavbarItem } from '../components/NavbarItem';
import { LearningPathsProvider } from '../hooks/learningPaths/LearningPathsProvider';
import { PathsNavbarItem } from '../components/PathsNavbarItem';

const MainApp = (): React.ReactElement => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;

  return (
    <AppShell
      header={{
        height: { base: 56, sm: 0 },
      }}
      navbar={{
        width: desktopOpened ? 260 : 72,
        breakpoint: 'sm',

        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      transitionDuration={400}
      transitionTimingFunction="ease"
    >
      <AppShell.Header hiddenFrom="sm" bg="dark.9">
        <Flex h="100%" px="md" align="center" justify="space-between" gap="sm">
          <Flex align="center" gap="xs">
            <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" />
            <Logo />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar
        p="xs"
        bg="dark.9"
        style={{
          transition: 'width .4s ease',
          overflow: 'hidden',
        }}
      >
        <Stack h="100%" justify="space-between" gap="xs" pb="lg">
          <Stack gap="xs">
            <Flex
              align="center"
              justify={desktopOpened ? 'space-between' : 'center'}
              px={desktopOpened ? 'sm' : 0}
              py="sm"
              visibleFrom="sm"
            >
              {desktopOpened && <Logo />}
              <Burger
                opened={desktopOpened}
                onClick={toggleDesktop}
                size="sm"
              />
            </Flex>
            <Stack gap={4} mt="sm">
              <NavbarItem
                to="/app"
                label="Dashboard"
                icon={<LayoutDashboardIcon size={18} />}
                expanded={desktopOpened}
              />
              <NavbarItem
                to="/app/create-path"
                label="Create path"
                icon={<PlusIcon size={18} />}
                expanded={desktopOpened}
              />
              <NavbarItem
                to="/app/watch-history"
                label="Watch history"
                icon={<HistoryIcon size={18} />}
                expanded={desktopOpened}
              />
              {desktopOpened && <PathsNavbarItem />}
            </Stack>
          </Stack>

          <Stack gap={4} pt="sm" style={{
            borderTop: '1px solid var(--mantine-color-dark-5)',
          }}>
            <NavbarItem
              to="/app/settings"
              label="Settings"
              icon={<SettingsIcon size={18} />}
              expanded={desktopOpened}
            />
            <NavbarItem
              onClick={logout}
              label="Logout"
              icon={<LogOutIcon size={18} />}
              expanded={desktopOpened}
              danger={true}
            />
            <UserInfoNavSection expanded={desktopOpened} user={user} />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export const ProtectedRoute = (): React.ReactElement => {
  return (
    <LearningPathsProvider>
      <MainApp />
    </LearningPathsProvider>
  );
};
