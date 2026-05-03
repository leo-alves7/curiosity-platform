import { useState, useEffect } from 'react'
import { IonButton, IonSkeletonText, IonText } from '@ionic/react'
import { Share } from '@capacitor/share'
import { useTranslation } from 'react-i18next'
import { fetchStore } from '@/api/stores'
import type { StoreResponse } from '@/types/store'
import StoreDetailContent from './StoreDetailContent'

interface StoreDetailViewProps {
  storeId: string
  categoryMap: Record<string, string>
  onClose: () => void
}

function StoreDetailView({ storeId, categoryMap, onClose }: StoreDetailViewProps) {
  const { t } = useTranslation()
  const [store, setStore] = useState<StoreResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setStatus('loading')
    setStore(null)
    setError(null)
    fetchStore(storeId)
      .then((data) => {
        setStore(data)
        setStatus('succeeded')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load store')
        setStatus('failed')
      })
  }, [storeId, retryKey])

  const handleShare = async () => {
    const url = `${import.meta.env.VITE_APP_URL ?? window.location.origin}/stores/${storeId}`
    await Share.share({
      title: store?.name ?? '',
      text: `Check out ${store?.name ?? 'this store'}`,
      url,
      dialogTitle: 'Share store',
    })
  }

  if (status === 'loading') {
    return (
      <div style={{ padding: 16 }}>
        <IonSkeletonText animated style={{ height: 200, marginBottom: 16 }} />
        <IonSkeletonText animated style={{ height: 24, marginBottom: 8 }} />
        <IonSkeletonText animated style={{ height: 20, marginBottom: 8 }} />
        <IonSkeletonText animated style={{ height: 60 }} />
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div style={{ padding: 16 }}>
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
        <IonButton onClick={() => setRetryKey((k) => k + 1)}>{t('storeDetail.retry')}</IonButton>
      </div>
    )
  }

  if (store === null) {
    return null
  }

  return (
    <StoreDetailContent
      store={store}
      categoryName={categoryMap[store.category_id ?? ''] ?? undefined}
      onShare={handleShare}
      onClose={onClose}
    />
  )
}

export default StoreDetailView
