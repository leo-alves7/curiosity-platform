import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react'
import { storefrontOutline } from 'ionicons/icons'
import type { StoreResponse } from '@/types/store'

interface StoreCardProps {
  store: StoreResponse
  categoryName: string | undefined
  onClick: (storeId: string) => void
}

function StoreCard({ store, categoryName, onClick }: StoreCardProps) {
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
      aria-label={`View ${store.name} on map`}
    >
      <div
        style={{
          width: '100%',
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ion-color-light, #f4f5f8)',
        }}
      >
        {store.image_url ? (
          <img
            src={store.image_url}
            alt={store.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <IonIcon
            icon={storefrontOutline}
            aria-hidden="true"
            style={{ fontSize: 48, color: 'var(--ion-color-medium, #92949c)' }}
          />
        )}
      </div>
      <IonCardHeader>
        <IonCardTitle>{store.name}</IonCardTitle>
        <IonCardSubtitle
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {store.address ?? 'Address unavailable'}
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
