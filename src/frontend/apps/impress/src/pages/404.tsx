import { Button } from '@openfun/cunningham-react';
import Image from 'next/image';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import img403 from '@/assets/icons/icon-403.png';
import { Box, StyledLink, Text } from '@/components';
import { PageLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/next';

const StyledButton = styled(Button)`
  width: fit-content;
`;

const Page: NextPageWithLayout = () => {
  const { t } = useTranslation();

  return (
    <Box
      $align="center"
      $margin="auto"
      $gap="1rem"
      $padding={{ bottom: '2rem' }}
    >
      <Image
        src={img403}
        alt={t('Image 403')}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      <Box $align="center" $gap="0.8rem">
        <Text as="p" $textAlign="center" $maxWidth="350px" $theme="primary">
          {t(
            'It seems that the page you are looking for does not exist or cannot be displayed correctly.',
          )}
        </Text>

        <StyledLink href="/">
          <StyledButton
            icon={
              <Text $isMaterialIcon $color="white">
                house
              </Text>
            }
          >
            {t('Home')}
          </StyledButton>
        </StyledLink>
      </Box>
    </Box>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <PageLayout withFooter={false}>{page}</PageLayout>;
};

export default Page;
