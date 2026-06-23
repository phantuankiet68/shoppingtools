'use client';

import { REGISTRY } from '@/lib/ui-builder/registry';
import React, { useEffect, useState } from 'react';

type Block = {
    id?: string;
    kind: string;
    props: any;
};

type RegistryItem = (typeof REGISTRY)[number];
type Slots = Parameters<RegistryItem['render']>[1];

const emptySlots: Slots = {
    slot: (() => null) as Slots['slot'],
    slotAt: (() => null) as Slots['slotAt'],
};

export default function RenderBlocksPublic({
    blocks,
    siteId,
    productSlug,
    currentPath,
    rawSegments,
}: {
    blocks: Block[];
    siteId?: string;
    productSlug?: string | null;
    currentPath?: string;
    rawSegments?: string[];
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            {blocks.map((b, i) => {
                const reg = REGISTRY.find((r) => r.kind === b.kind);
                const blockId = b.id || b?.props?.id || `${b.kind}-${i}`;

                if (!reg) {
                    return <div key={blockId}>Unknown block: {b.kind}</div>;
                }

                const enrichedProps = {
                    ...b.props,
                    siteId,
                    blockId,
                    preview: false,
                    productSlug,
                    currentPath,
                    rawSegments,
                };

                return (
                    <React.Fragment key={blockId}>
                        {reg.render(enrichedProps ?? {}, emptySlots)}
                    </React.Fragment>
                );
            })}
        </>
    );
}
