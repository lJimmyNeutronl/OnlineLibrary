import React from 'react';
import { Typography } from '@components/common';
import styles from './SectionHeader.module.css';

const { Title } = Typography;

interface SectionHeaderProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  level = 3, 
  className = "" 
}) => {
  return (
    <div className={`${styles.sectionHeader} ${className}`}>
      <div className={styles.sectionDividerLeft}></div>
      <Title level={level} className={styles.sectionTitle}>
        {title}
      </Title>
      <div className={styles.sectionDividerRight}></div>
    </div>
  );
};

export default SectionHeader; 