import {
  Button,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { APIError } from '@/api';
import { Box } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { Doc, Role } from '@/docs/doc-management';
import { User } from '@/features/auth';

import { useCreateDocAccess, useCreateDocInvitation } from '../api';
import { OptionType } from '../types';

import { DocRoleDropdown } from './DocRoleDropdown';
import { DocShareAddMemberListItem } from './DocShareAddMemberListItem';

type APIErrorUser = APIError<{
  value: string;
  type: OptionType;
}>;

type Props = {
  doc: Doc;
  selectedUsers: User[];
  onRemoveUser?: (user: User) => void;
  onSubmit?: (selectedUsers: User[], role: Role) => void;
  afterInvite?: () => void;
};
export const DocShareAddMemberList = ({
  doc,
  selectedUsers,
  onRemoveUser,
  afterInvite,
}: Props) => {
  const { t } = useTranslation();
  const { toast } = useToastProvider();

  const [isLoading, setIsLoading] = useState(false);
  const { spacingsTokens, colorsTokens } = useCunninghamTheme();
  const [invitationRole, setInvitationRole] = useState<Role>(Role.EDITOR);
  const canShare = doc.abilities.accesses_manage;
  const { mutateAsync: createInvitation } = useCreateDocInvitation();
  const { mutateAsync: createDocAccess } = useCreateDocAccess();

  const onError = (dataError: APIErrorUser) => {
    let messageError =
      dataError['data']?.type === OptionType.INVITATION
        ? t(`Failed to create the invitation for {{email}}.`, {
            email: dataError['data']?.value,
          })
        : t(`Failed to add the member in the document.`);

    if (
      dataError.cause?.[0] ===
      'Document invitation with this Email address and Document already exists.'
    ) {
      messageError = t('"{{email}}" is already invited to the document.', {
        email: dataError['data']?.value,
      });
    }

    if (
      dataError.cause?.[0] ===
      'This email is already associated to a registered user.'
    ) {
      messageError = t('"{{email}}" is already member of the document.', {
        email: dataError['data']?.value,
      });
    }

    toast(messageError, VariantType.ERROR, {
      duration: 4000,
    });
  };

  const onInvite = async () => {
    setIsLoading(true);
    const promises = selectedUsers.map((user) => {
      const isInvitationMode = user.id === user.email;

      const payload = {
        role: invitationRole,
        docId: doc.id,
      };

      return isInvitationMode
        ? createInvitation({
            ...payload,
            email: user.email,
          })
        : createDocAccess({
            ...payload,
            memberId: user.id,
          });
    });

    const settledPromises = await Promise.allSettled(promises);
    settledPromises.forEach((settledPromise) => {
      if (settledPromise.status === 'rejected') {
        onError(settledPromise.reason as APIErrorUser);
      }
    });
    afterInvite?.();
    setIsLoading(false);
  };

  return (
    <Box
      data-testid="doc-share-add-member-list"
      $direction="row"
      $padding={spacingsTokens.sm}
      $align="center"
      $background={colorsTokens['greyscale-050']}
      $radius={spacingsTokens['3xs']}
      $css={css`
        border: 1px solid ${colorsTokens['greyscale-200']};
      `}
      className="--docs--doc-share-add-member-list"
    >
      <Box
        $direction="row"
        $align="center"
        $wrap="wrap"
        $flex={1}
        $gap={spacingsTokens.xs}
      >
        {selectedUsers.map((user) => (
          <DocShareAddMemberListItem
            key={user.id}
            user={user}
            onRemoveUser={onRemoveUser}
          />
        ))}
      </Box>
      <Box $direction="row" $align="center" $gap={spacingsTokens.xs}>
        <DocRoleDropdown
          canUpdate={canShare}
          currentRole={invitationRole}
          onSelectRole={setInvitationRole}
        />
        <Button onClick={() => void onInvite()} disabled={isLoading}>
          {t('Invite')}
        </Button>
      </Box>
    </Box>
  );
};
