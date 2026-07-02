import React, { useRef } from 'react';
import { Box, Button, Flex, Stack, Title } from '@mantine/core';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import styles from './home.module.css';
import { CircleCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { StyledButton } from '../../components/StyledButton';

export const Home = (): React.ReactElement => {
  const moreInfoRef = useRef<HTMLDivElement>(null);

  const handleLearnMore = () => {
    if (moreInfoRef.current)
      moreInfoRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoogleSSO = () => {
    window.location.href = 'https://localhost/api/auth/google';
  };

  return (
    <>
      <Flex
        className={styles.homeHeader}
        align="center"
        px={32}
        justify="space-between"
      >
        <Logo />
        <Flex gap="lg" align="center">
          <StyledButton size="xs" onClick={handleGoogleSSO}>
            Sign In
          </StyledButton>
          <a
            href="https://github.com"
            target="_blank"
            className={styles.headerIconLinks}
          >
            <span className={styles.githubIcon}></span>
          </a>
        </Flex>
      </Flex>
      <Stack gap="xl" h="80vh" justify="center" align="center">
        <Stack gap="md" justify="center" align="center">
          <Box className={styles.homeTitle}>
            <Title order={1}>Craft Your Mind</Title>
            <Title order={1}>With Curated Knowledge</Title>
          </Box>
          <Title order={3} size="h3" className={styles.homeSubTitle}>
            MindCraft helps you stay focused and level up new skills with
            AI-guided YouTube learning.
          </Title>
        </Stack>
        <Flex gap="lg">
          <StyledButton size="lg" onClick={handleGoogleSSO}>
            Sign Up
          </StyledButton>
          <Button
            size="lg"
            variant="light"
            color="white"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
        </Flex>
      </Stack>
      <Box className={styles.homeContainer}></Box>

      <Stack
        gap="lg"
        h="600px"
        justify="center"
        align="center"
        bg="transparent"
        ref={moreInfoRef}
      >
        <Flex gap="lg" className={styles.absoluteLottie}>
          <DotLottieReact src="/lottie/AI-logo-Foriday.lottie" loop autoplay />
        </Flex>
        <Box className={styles.homeTitle}>
          <Title order={2}>Learn Smarter, Not Harder.</Title>
        </Box>
        <Title order={3} size="h3" className={styles.homeSubTitle}>
          MindCraft creates personalized learning paths powered by AI. Whether
          you're mastering a new language, framework, or life skill — it maps
          out exactly what to learn next.
        </Title>
      </Stack>
      <Stack
        gap="lg"
        h="800px"
        justify="center"
        align="center"
        bg="transparent"
      >
        <Box className={styles.homeTitle}>
          <Title order={2}>Your Learning Companion </Title>
          <Title order={2}>in Three Steps</Title>
        </Box>
        <Flex gap="sm" align="center">
          <CircleCheck fill="#BD34FE" stroke="white" />
          <Title order={3} size="h3" className={styles.homeSubTitle}>
            Set a Goal – Tell MindCraft what you want to master.
          </Title>
        </Flex>

        <Flex gap="sm" align="center">
          <CircleCheck fill="#BD34FE" stroke="white" />
          <Title order={3} size="h3" className={styles.homeSubTitle}>
            Get a Path – AI curates the best sequence of topics and resources.
          </Title>
        </Flex>
        <Flex gap="sm" align="center">
          <CircleCheck fill="#BD34FE" stroke="white" />
          <Title order={3} size="h3" className={styles.homeSubTitle}>
            Track Progress – Stay focused and measure your growth effortlessly.
          </Title>
        </Flex>
        <Flex gap="lg">
          <DotLottieReact
            src="/lottie/AI-Powered-Learning.lottie"
            loop
            autoplay
          />
        </Flex>
      </Stack>
      <Stack
        gap="lg"
        h="400px"
        justify="center"
        align="center"
        bg="transparent"
      >
        <Box className={styles.homeTitle}>
          <Title order={2}>Because Focus Beats Overload.</Title>
        </Box>
        <Title order={3} size="h3" className={styles.homeSubTitle}>
          The internet is full of noise. MindCraft filters it into clarity —
          giving you structured, distraction-free progress toward your goals.
        </Title>
        <Flex gap="lg">
          <StyledButton size="lg" onClick={handleGoogleSSO}>
            Create your first path
          </StyledButton>
        </Flex>
      </Stack>
      <Flex
        justify="space-between"
        align="center"
        px={32}
        py={16}
        mt={80}
        className={styles.footer}
      >
        Copyright © 2025 MindCraft Inc. All rights reserved.
        <Flex gap="lg">
          <a href="https://github.com" target="_blank">
            Github
          </a>
          |
          <a href="https://github.com" target="_blank">
            Portfolio
          </a>
        </Flex>
      </Flex>
    </>
  );
};
