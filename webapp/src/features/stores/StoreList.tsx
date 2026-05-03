import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonSpinner,
  IonText,
} from '@ionic/react'
import { useTranslation } from 'react-i18next'
import StoreCard from './StoreCard'
import type { StoreResponse } from '@/types/store'

interface StoreListProps {
  stores: StoreResponse[]
  categoryMap: Record<string, string>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  onStoreClick: (storeId: string) => void
  onLoadMore: () => void
  hasMore: boolean
}

function StoreList({
  stores,
  categoryMap,
  status,
  error,
  onStoreClick,
  onLoadMore,
  hasMore,
}: StoreListProps) {
  const { t } = useTranslation()

  if (status === 'loading' && stores.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <IonSpinner aria-label={t('storeList.loading')} />
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <IonText color="danger">
        <p style={{ padding: 16 }}>
          {t('storeList.failedToLoad', { error: error ? `: ${error}` : '' })}
        </p>
      </IonText>
    )
  }

  if (stores.length === 0) {
    return (
      <IonText color="medium">
        <p style={{ padding: 16, textAlign: 'center' }}>{t('storeList.noStores')}</p>
      </IonText>
    )
  }

  const handleInfinite = async (event: CustomEvent<void>) => {
    onLoadMore()
    await (event.target as HTMLIonInfiniteScrollElement).complete()
  }

  return (
    <>
      <IonList>
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            categoryName={categoryMap[store.category_id ?? '']}
            onClick={onStoreClick}
          />
        ))}
      </IonList>
      <IonInfiniteScroll onIonInfinite={handleInfinite} disabled={!hasMore} threshold="100px">
        <IonInfiniteScrollContent
          loadingText={t('storeList.loadingMore')}
          loadingSpinner="bubbles"
        />
      </IonInfiniteScroll>
    </>
  )
}

export default StoreList
