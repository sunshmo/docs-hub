import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { Document, SearchData, SearchDataEnum } from 'docs-hub-shared-models';
import { DataItem, VirtualList } from '@/components/virtual-list';
import { useSession } from '@/hooks/use-session';
import request from '@/request';
import { SearchItem } from '@/components/super-search/search-item';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export function ContentRecord({ className, jump }: {
  className?: string;
  jump?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: SearchData) => void;
}) {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState(SearchDataEnum.session as string);
  const [documents, setDocuments] = useState<Document[]>([]);

  const { load: loadSessions, sessionList } = useSession();

  function loadDocuments() {
    request('/api/document/condition', {
      method: 'post',
      body: JSON.stringify({}),
    }).then(res => res.json())
      .then(res => {
        setDocuments(Array.isArray(res.data) ? res.data : []);
      });
  }

  const loadData = useCallback(() => {
    switch (tab) {
      case SearchDataEnum.session:
        loadSessions();
        break;
      case SearchDataEnum.document:
        loadDocuments();
        break;
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [tab]);

  function getDataList() {
    let results: { label: string; value: string; id: string; name: string; userId: string; createdAt?: string; updatedAt?: string; }[] | DataItem[] = [];
    switch (tab) {
      case SearchDataEnum.session:
        results = sessionList.map(e => ({ ...e, label: e.name, value: `${SearchDataEnum.session}-${e.id}`, updatedAt: dayjs(e.updatedAt).format('YYYY/MM/DD'), type: SearchDataEnum.session }));
        break;
      case SearchDataEnum.document:
        results = documents.map(e => ({ ...e, label: e.name, value: `${SearchDataEnum.document}-${e.id}`, updatedAt: dayjs(e.updatedAt).format('YYYY/MM/DD'), type: SearchDataEnum.document }));
        break;
    }
    return results as DataItem[];
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <Tabs
        value={tab}
        onValueChange={setTab}
        defaultValue={SearchDataEnum.session}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value={SearchDataEnum.session}>{t('superSearch.chat')}</TabsTrigger>
          <TabsTrigger value={SearchDataEnum.document}>{t('superSearch.document')}</TabsTrigger>
        </TabsList>
      </Tabs>
      <VirtualList
        data={getDataList()}
        onRenderItem={(item, virtualItem) => {
          return (
            <div className="h-full pt-2" onClick={(event) => jump?.(event, item!)}>
              <SearchItem className="w-full h-full cursor-pointer" data={item as DataItem} />
            </div>
          );
        }}
      />
    </div>
  )
}
