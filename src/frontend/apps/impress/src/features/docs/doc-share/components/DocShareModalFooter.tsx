import { Button } from '@openfun/cunningham-react';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { Box, HorizontalSeparator } from '@/components';
import { Doc, useCopyDocLink } from '@/features/docs';

import { DocVisibility } from './DocVisibility';

type Props = {
  doc: Doc;
  onClose: () => void;
};

export const DocShareModalFooter = ({ doc, onClose }: Props) => {
  const copyDocLink = useCopyDocLink(doc.id);
  const { t } = useTranslation();
  return (
    <Box
      $css={css`
        flex-shrink: 0;
      `}
      className="--docs--doc-share-modal-footer"
    >
      <HorizontalSeparator $withPadding={true} />

      <DocVisibility doc={doc} />
      <HorizontalSeparator />

      <Box
        $direction="row"
        $justify="space-between"
        $padding={{ horizontal: 'base', bottom: 'base' }}
      >
        <Button
          fullWidth={false}
          onClick={copyDocLink}
          color="tertiary"
          icon={<span className="material-icons">add_link</span>}
        >
          {t('Copy link')}
        </Button>
        <Button onClick={onClose} color="primary">
          {t('OK')}
        </Button>
      </Box>
    </Box>
  );
};
