import React from 'react';

import styles from './logo.module.css';

interface LogoProps {
  onClick?: () => void;
}

export const Logo = ({ onClick }: LogoProps): React.ReactElement => {
  return (
    <img
      className={styles.logo}
      src="/images/MindCraft-Logo.png"
      alt="MindCraft"
      onClick={onClick && onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};
