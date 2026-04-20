import { IonButton, IonText } from '@ionic/react'
import type { StoreResponse } from '@/types/store'

interface StorePopupProps {
  store: StoreResponse
  categoryName: string | undefined
  onViewDetails: (storeId: string) => void
}

function StorePopup({ store, categoryName, onViewDetails }: StorePopupProps) {
  return (
    <div style={{ minWidth: 200, padding: '8px 4px' }}>
      <h3 style={{ margin: '0 0 4px' }}>{store.name}</h3>
      <IonText color="medium">
        <p style={{ margin: '0 0 4px' }}>{categoryName ?? 'Uncategorised'}</p>
        <p style={{ margin: '0 0 8px' }}>{store.address ?? 'Address unavailable'}</p>
      </IonText>
      <IonButton size="small" onClick={() => onViewDetails(store.id)}>
        View details
      </IonButton>
    </div>
  )
}

export default StorePopup
