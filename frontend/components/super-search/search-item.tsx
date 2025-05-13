import * as React from 'react';
import { cn } from '@/lib/utils';
import { SearchData, SearchDataEnum, SearchDataType } from 'docs-hub-shared-models';
import { BookText, MessagesSquare } from 'lucide-react';

const SearchItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
  data: SearchData;
}
>(({ className, data, ...props }, ref) => {

  const renderIcon = (type: SearchDataType) => {
    switch (type) {
      case SearchDataEnum.document:
        return <BookText className="w-4 h-4" />;
      case SearchDataEnum.session:
        return <MessagesSquare className="w-4 h-4" />;
      default:
        return <></>;
    }
  }

  return (
    <div ref={ref} className={cn('flex items-center p-1 rounded-md overflow-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', className)} {...props}>
      <div className="pr-1">{renderIcon(data.type)}</div>
      <div className="flex-1 overflow-hidden">
        <div className="truncate">{data.name}</div>
        <div className="truncate text-sm">{data.content}</div>
      </div>
      <div className="pl-1 text-xs">{data.updatedAt}</div>
    </div>
  )
});
SearchItem.displayName = 'SearchItem';

export {
  SearchItem,
};
