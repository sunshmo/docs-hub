import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { ReactNode, useRef } from 'react';
import { SearchData } from 'docs-hub-shared-models';
import { cn } from '@/lib/utils';

type Value = string | number | boolean | null | undefined;

export interface DataItem extends SearchData {
  label?: Value;
  value?: Value;
  [prop: string]: unknown
}

export function VirtualList({ className, data, onRenderItem }: {
  className?: string;
  data?: DataItem[];
  onRenderItem?: (item: DataItem | null, virtualItem: VirtualItem) => ReactNode;
}) {
  // The scrollable element for your list
  const parentRef = useRef(null)

  const isArray = Array.isArray(data);

  const rowVirtual = useVirtualizer({
    count: isArray ? data.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
  });

  if (!isArray) {
    return <></>;
  }

  return (
    <div ref={parentRef} className={cn("overflow-y-auto", className)}>
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtual.getTotalSize()}px`,
        }}
      >
        {rowVirtual.getVirtualItems().map((virtualItem: VirtualItem) => {
          const item = data[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {typeof onRenderItem === 'function' ? onRenderItem(item, virtualItem) : item.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}