import { Button } from '@openfun/cunningham-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components';
import { ModalCreateDoc } from '@/features/docs/doc-management';

import { DocsGrid } from './DocsGrid';

export const DocsGridContainer = () => {
  const { t } = useTranslation();
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

  return (
    <Box $overflow="auto">
      <DocsGrid
        topSlot={
          <Box $align="flex-end" $justify="center">
            <Button
              onClick={() => {
                setIsModalCreateOpen(true);
              }}
            >
              {t('Create a new document')}
            </Button>
          </Box>
        }
      />
      {isModalCreateOpen && (
        <ModalCreateDoc onClose={() => setIsModalCreateOpen(false)} />
      )}
    </Box>
  );
};
