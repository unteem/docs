import {
  OpenMap,
  TreeView,
  TreeViewMoveResult,
  useTreeContext,
} from '@gouvfr-lasuite/ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { css } from 'styled-components';

import { Box, StyledLink } from '@/components';
import { useCunninghamTheme } from '@/cunningham';

import { Doc, KEY_SUB_PAGE, useDoc } from '../../doc-management';
import { SimpleDocItem } from '../../docs-grid';
import { useDocTree } from '../api/useDocTree';
import { useMoveDoc } from '../api/useMove';

import { DocSubPageItem } from './DocSubPageItem';
import { DocTreeItemActions } from './DocTreeItemActions';

type DocTreeProps = {
  initialTargetId: string;
};
export const DocTree = ({ initialTargetId }: DocTreeProps) => {
  const { spacingsTokens } = useCunninghamTheme();
  const spacing = spacingsTokens();
  const treeData = useTreeContext<Doc>();
  const { data: rootNode } = useDoc(
    { id: treeData?.root?.id ?? '' },
    {
      enabled: !!treeData?.root?.id,
      initialData: treeData?.root ?? undefined,
      queryKey: [KEY_SUB_PAGE, { id: treeData?.root?.id ?? '' }],
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
  const router = useRouter();
  const [initialOpenState, setInitialOpenState] = useState<OpenMap | undefined>(
    undefined,
  );

  const { mutate: moveDoc } = useMoveDoc();

  const { data } = useDocTree({
    docId: initialTargetId,
  });

  const handleMove = (result: TreeViewMoveResult) => {
    moveDoc({
      sourceDocumentId: result.sourceId,
      targetDocumentId: result.targetModeId,
      position: result.mode,
    });
    treeData?.treeData.handleMove(result);
  };
  useEffect(() => {
    if (!data) {
      return;
    }
    const { children: rootChildren, ...root } = data;
    const children = rootChildren ?? [];
    treeData?.setRoot(root);
    const initialOpenState: OpenMap = {};
    initialOpenState[root.id] = true;
    const serialize = (children: Doc[]) => {
      children.forEach((child) => {
        child.childrenCount = child.numchild ?? 0;
        if (child?.children?.length && child?.children?.length > 0) {
          initialOpenState[child.id] = true;
        }
        serialize(child.children ?? []);
      });
    };
    serialize(children);

    treeData?.treeData.resetTree(children);
    setInitialOpenState(initialOpenState);
    if (initialTargetId === root.id) {
      treeData?.treeData.setSelectedNode(root);
    } else {
      treeData?.treeData.selectNodeById(initialTargetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const rootIsSelected =
    treeData?.treeData.selectedNode?.id === treeData?.root?.id;

  if (!initialTargetId || !treeData) {
    return null;
  }

  return (
    <Box data-testid="doc-tree" $height="100%">
      <Box $padding={{ horizontal: 'sm', top: 'sm', bottom: '2px' }}>
        <Box
          $css={css`
            padding: ${spacing['2xs']};
            border-radius: 4px;
            width: 100%;
            background-color: ${rootIsSelected
              ? 'var(--c--theme--colors--greyscale-100)'
              : 'transparent'};

            &:hover {
              background-color: var(--c--theme--colors--greyscale-100);
            }

            .doc-tree-root-item-actions {
              display: 'flex';
              opacity: 0;

              &:has(.isOpen) {
                opacity: 1;
              }
            }
            &:hover {
              .doc-tree-root-item-actions {
                opacity: 1;
              }
            }
          `}
        >
          {treeData.root !== null && rootNode && (
            <StyledLink
              $css={css`
                width: 100%;
              `}
              href={`/docs/${treeData.root.id}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                treeData.treeData.setSelectedNode(treeData.root ?? undefined);
                router.push(`/docs/${treeData?.root?.id}`);
              }}
            >
              <Box $direction="row" $align="center" $width="100%">
                <SimpleDocItem doc={rootNode} showAccesses={true} />
                <div className="doc-tree-root-item-actions">
                  <DocTreeItemActions
                    doc={rootNode}
                    onCreateSuccess={(createdDoc) => {
                      const newDoc = {
                        ...createdDoc,
                        children: [],
                        childrenCount: 0,
                        parentId: treeData.root?.id ?? undefined,
                      };
                      treeData?.treeData.addChild(null, newDoc);
                    }}
                  />
                </div>
              </Box>
            </StyledLink>
          )}
        </Box>
      </Box>

      {initialOpenState && treeData.treeData.nodes.length > 0 && (
        <TreeView
          initialOpenState={initialOpenState}
          afterMove={handleMove}
          selectedNodeId={
            treeData.treeData.selectedNode?.id ??
            treeData.initialTargetId ??
            undefined
          }
          rootNodeId={treeData.root?.id ?? ''}
          renderNode={(props) => {
            return (
              <DocSubPageItem
                {...props}
                doc={props.node.data.value as Doc}
                setSelectedNode={treeData.treeData.setSelectedNode}
              />
            );
          }}
        />
      )}
    </Box>
  );
};
