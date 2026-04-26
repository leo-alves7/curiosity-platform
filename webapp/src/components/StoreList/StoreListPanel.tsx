import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/react'
import { useTranslation } from 'react-i18next'
import { closeOutline } from 'ionicons/icons'
import StoreList from './StoreList'
import { useSearchDebounce } from './useSearchDebounce'
import { togglePanel } from '@/slices/uiSlice'
import type { AppDispatch } from '@/store'
import type { CategoryResponse } from '@/types/category'
import type { StoreResponse } from '@/types/store'

interface StoreListPanelProps {
  filteredStores: StoreResponse[]
  categories: CategoryResponse[]
  categoryMap: Record<string, string>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  searchQuery: string
  selectedCategoryId: string | null
  hasMore: boolean
  isMobile?: boolean
  onSearchChange: (query: string) => void
  onCategoryChange: (categoryId: string | null) => void
  onLoadMore: () => void
  onStoreClick: (storeId: string) => void
}

const ALL_CATEGORIES_VALUE = '__all__'

function StoreListPanel({
  filteredStores,
  categories,
  categoryMap,
  status,
  error,
  searchQuery,
  selectedCategoryId,
  hasMore,
  isMobile,
  onSearchChange,
  onCategoryChange,
  onLoadMore,
  onStoreClick,
}: StoreListPanelProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useSearchDebounce(localQuery, 300, onSearchChange)

  const handleSegmentChange = (value: string | number | undefined) => {
    if (value === ALL_CATEGORIES_VALUE || value === undefined) {
      onCategoryChange(null)
    } else {
      onCategoryChange(String(value))
    }
  }

  const segmentValue = selectedCategoryId ?? ALL_CATEGORIES_VALUE

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IonText>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>
              {t('storeList.heading')}
            </h2>
          </IonText>
          {isMobile && (
            <IonButton
              size="small"
              fill="clear"
              color="medium"
              aria-label={t('storeList.closePanel')}
              onClick={() => dispatch(togglePanel())}
            >
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          )}
        </div>
        <IonSearchbar
          aria-label={t('storeList.search')}
          value={localQuery}
          placeholder={t('storeList.search')}
          debounce={0}
          onIonInput={(event) => setLocalQuery(event.detail.value ?? '')}
        />
        {categories.length > 0 && (
          <IonSegment
            scrollable
            value={segmentValue}
            onIonChange={(event) => handleSegmentChange(event.detail.value)}
          >
            <IonSegmentButton value={ALL_CATEGORIES_VALUE}>
              <IonLabel>
                <span>{t('storeList.all')}</span>
              </IonLabel>
            </IonSegmentButton>
            {categories.map((cat) => (
              <IonSegmentButton key={cat.id} value={cat.id}>
                <IonLabel>
                  <span>{cat.name}</span>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <StoreList
          stores={filteredStores}
          categoryMap={categoryMap}
          status={status}
          error={error}
          onStoreClick={onStoreClick}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}

export default StoreListPanel
