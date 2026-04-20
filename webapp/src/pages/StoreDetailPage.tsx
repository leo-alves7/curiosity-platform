import { useParams } from 'react-router-dom'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useSelector } from 'react-redux'
import { selectCategoryMap } from '@/slices/storesSlice'
import { StoreDetailView } from '@/components/StoreDetail'

function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const categoryMap = useSelector(selectCategoryMap)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Store Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {id !== undefined && (
          <StoreDetailView
            storeId={id}
            categoryMap={categoryMap}
            onClose={() => {
              // IonBackButton handles navigation
            }}
          />
        )}
      </IonContent>
    </IonPage>
  )
}

export default StoreDetailPage
