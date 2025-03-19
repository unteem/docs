import { Server } from '@hocuspocus/server';
import axios from 'axios';

import { COLLABORATION_BACKEND_BASE_URL } from '@/env';
import { logger } from '@/utils';
import { IncomingHttpHeaders } from 'http';

enum LinkReach {
  RESTRICTED = 'restricted',
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
}

enum LinkRole {
  READER = 'reader',
  EDITOR = 'editor',
}

type Base64 = string;

interface Doc {
  id: string;
  title?: string;
  content: Base64;
  creator: string;
  is_favorite: boolean;
  link_reach: LinkReach;
  link_role: LinkRole;
  nb_accesses_ancestors: number;
  nb_accesses_direct: number;
  created_at: string;
  updated_at: string;
  abilities: {
    accesses_manage: boolean;
    accesses_view: boolean;
    ai_transform: boolean;
    ai_translate: boolean;
    attachment_upload: boolean;
    children_create: boolean;
    children_list: boolean;
    collaboration_auth: boolean;
    destroy: boolean;
    favorite: boolean;
    invite_owner: boolean;
    link_configuration: boolean;
    media_auth: boolean;
    move: boolean;
    partial_update: boolean;
    restore: boolean;
    retrieve: boolean;
    update: boolean;
    versions_destroy: boolean;
    versions_list: boolean;
    versions_retrieve: boolean;
  };
}

export const fetchDocument = async (documentName: string, requestHeaders: IncomingHttpHeaders) => {
  const response = await axios.get(
    `${COLLABORATION_BACKEND_BASE_URL}/api/v1.0/documents/${documentName}/`,
    {
      headers: {
        Cookie: requestHeaders['cookie'],
        Origin: requestHeaders['origin'],
      },
    },
  );
  return response.data as Doc;
};

export const hocusPocusServer = Server.configure({
  name: 'docs-collaboration',
  timeout: 30000,
  quiet: true,
  async onConnect({
    requestHeaders,
    connection,
    documentName,
    requestParameters,
  }) {
    const roomParam = requestParameters.get('room');

    if (documentName !== roomParam) {
      console.error(
        'Invalid room name - Probable hacking attempt:',
        documentName,
        requestParameters.get('room'),
      );

      return Promise.reject(new Error('Wrong room name: Unauthorized'));
    }

    let can_edit = false;

    try {
      const document = await fetchDocument(documentName, requestHeaders);

      if (!document.abilities.retrieve) {
        console.error(
          'onConnect: Unauthorized to retrieve this document',
          roomParam,
        );
        return Promise.reject(new Error('Wrong abilities:Unauthorized'));
      }

      can_edit = document.abilities.update;
    } catch (error) {
      console.error('onConnect: backend error', error);
      return Promise.reject(new Error('Backend error: Unauthorized'));
    }

    connection.readOnly = !can_edit;

    logger(
      'Connection established:',
      documentName,
      'canEdit:',
      can_edit,
      'room:',
      requestParameters.get('room'),
    );
    console.debug('onConnect: Connection established', documentName);
    return Promise.resolve();
  },
});
