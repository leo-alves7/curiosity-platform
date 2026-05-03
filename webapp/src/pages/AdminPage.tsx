import { useState } from 'react'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'
import StoreManagement from '../features/admin/StoreManagement'
import CategoryManagement from '../features/admin/CategoryManagement'

type AdminTab = 'stores' | 'categories'

function AdminPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AdminTab>('stores')
  const { status, error } = useSelector((state: RootState) => state.admin)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('admin.title')}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as AdminTab)}
          >
            <IonSegmentButton value="stores">
              <IonLabel>{t('admin.tabStores')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="categories">
              <IonLabel>{t('admin.tabCategories')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {status === 'failed' && error && (
          <IonText color="danger">
            <p style={{ padding: '8px 16px' }}>{error}</p>
          </IonText>
        )}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </IonContent>
    </IonPage>
  )
}

export default AdminPage
