import { IonButton, IonChip, IonItem, IonLabel, IonList, IonText } from '@ionic/react'
import { Store, Share2, X } from 'lucide-react'
import type { StoreResponse } from '@/types/store'

interface StoreDetailContentProps {
  store: StoreResponse
  categoryName: string | undefined
  onShare: () => void
  onClose: () => void
}

function StoreDetailContent({ store, categoryName, onShare, onClose }: StoreDetailContentProps) {
  return (
    <div>
      <div
        style={{
          position: 'relative',
          height: 220,
          background: 'var(--ion-color-light, #f4f5f8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {store.image_url ? (
          <img
            src={store.image_url}
            alt={store.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Store size={64} aria-hidden="true" color="var(--ion-color-medium, #92949c)" />
        )}
        <IonButton
          fill="clear"
          aria-label="Close"
          onClick={onClose}
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          <X size={20} />
        </IonButton>
      </div>

      <IonList>
        <IonItem lines="none">
          <h2 style={{ margin: 0 }}>{store.name}</h2>
        </IonItem>

        {categoryName !== undefined && (
          <IonItem lines="none">
            <IonChip color="primary">
              <IonLabel>
                <span>{categoryName}</span>
              </IonLabel>
            </IonChip>
          </IonItem>
        )}

        <IonItem lines="none">
          <IonText color="medium">
            <p>{store.address ?? 'Address unavailable'}</p>
          </IonText>
        </IonItem>

        <IonItem lines="none">
          <IonText>
            <p>{store.description ?? 'No description available.'}</p>
          </IonText>
        </IonItem>

        <IonItem lines="none">
          <IonButton expand="block" onClick={onShare}>
            <span slot="start" style={{ display: 'flex' }}>
              <Share2 size={18} />
            </span>
            Share
          </IonButton>
        </IonItem>
      </IonList>
    </div>
  )
}

export default StoreDetailContent
