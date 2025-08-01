import { ReactNode } from 'react';

import { useCunninghamTheme } from '@/cunningham';
import { useResponsiveStore } from '@/stores';

import { Box } from '../Box';

export type QuickSearchItemContentProps = {
  alwaysShowRight?: boolean;
  left: ReactNode;
  right?: ReactNode;
};

export const QuickSearchItemContent = ({
  alwaysShowRight = false,
  left,
  right,
}: QuickSearchItemContentProps) => {
  const { spacingsTokens } = useCunninghamTheme();

  const { isDesktop } = useResponsiveStore();

  return (
    <Box
      $direction="row"
      $align="center"
      $padding={{ horizontal: '2xs', vertical: '4xs' }}
      $justify="space-between"
      $minHeight="34px"
      $width="100%"
    >
      <Box
        $direction="row"
        $align="center"
        $gap={spacingsTokens['2xs']}
        $width="100%"
      >
        {left}
      </Box>

      {isDesktop && right && (
        <Box
          className={!alwaysShowRight ? 'show-right-on-focus' : ''}
          $direction="row"
          $align="center"
        >
          {right}
        </Box>
      )}
    </Box>
  );
};
