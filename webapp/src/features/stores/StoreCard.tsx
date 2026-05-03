import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonLabel,
} from '@ionic/react'
import { Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { StoreResponse } from '@/types/store'

interface StoreCardProps {
  store: StoreResponse
  categoryName: string | undefined
  onClick: (storeId: string) => void
}

function StoreCard({ store, categoryName, onClick }: StoreCardProps) {
  const { t } = useTranslation()
  const handleClick = () => onClick(store.id)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLIonCardElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(store.id)
    }
  }

  return (
    <IonCard
      button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={t('storeList.viewOnMap', { name: store.name })}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          overflow: 'hidden',
          background: 'var(--ion-color-light)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {store.image_url ? (
            <img
              src={store.image_url}
              alt={store.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Store size={48} aria-hidden="true" color="var(--ion-color-medium)" />
          )}
        </div>
      </div>
      <IonCardHeader>
        <IonCardTitle style={{ fontWeight: 700 }}>{store.name}</IonCardTitle>
        <IonCardSubtitle
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {store.address ?? t('storeList.addressUnavailable')}
        </IonCardSubtitle>
      </IonCardHeader>
      {categoryName && (
        <IonCardContent>
          <IonChip color="primary">
            <IonLabel>
              <span>{categoryName}</span>
            </IonLabel>
          </IonChip>
        </IonCardContent>
      )}
    </IonCard>
  )
}

export default StoreCard
