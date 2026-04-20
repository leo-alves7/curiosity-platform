import { useState } from 'react'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import StoreManagement from '../components/Admin/StoreManagement'
import CategoryManagement from '../components/Admin/CategoryManagement'

type AdminTab = 'stores' | 'categories'

function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('stores')
  const { status, error } = useSelector((state: RootState) => state.admin)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as AdminTab)}
          >
            <IonSegmentButton value="stores">
              <IonLabel>Stores</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="categories">
              <IonLabel>Categories</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {status === 'failed' && error && (
          <p style={{ color: 'red', padding: '8px 16px' }}>{error}</p>
        )}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </IonContent>
    </IonPage>
  )
}

export default AdminPage
