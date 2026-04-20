import { useEffect, useState } from 'react'
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonToggle,
} from '@ionic/react'
import { createOutline, trashOutline, addOutline } from 'ionicons/icons'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import {
  fetchAdminStoresThunk,
  fetchAdminCategoriesThunk,
  deleteStoreThunk,
  toggleStoreActiveThunk,
  openStoreForm,
  setSelectedStore,
} from '../../slices/adminSlice'
import StoreForm from './StoreForm'

function StoreManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { stores, status, error, selectedStore } = useSelector((state: RootState) => state.admin)
  const [search, setSearch] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAdminStoresThunk())
    dispatch(fetchAdminCategoriesThunk())
  }, [dispatch])

  const filtered = stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (store: (typeof stores)[number]) => {
    dispatch(setSelectedStore(store))
    dispatch(openStoreForm('edit'))
  }

  const handleAddNew = () => {
    dispatch(setSelectedStore(null))
    dispatch(openStoreForm('create'))
  }

  const handleToggleActive = (id: string) => {
    dispatch(toggleStoreActiveThunk(id))
  }

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      dispatch(deleteStoreThunk(deleteTargetId))
      setDeleteTargetId(null)
    }
  }

  if (status === 'loading') {
    return <IonSpinner />
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
        <IonInput
          value={search}
          onIonChange={(e) => setSearch(e.detail.value ?? '')}
          placeholder="Search stores..."
          style={{ flex: 1 }}
        />
        <IonButton onClick={handleAddNew}>
          <IonIcon slot="start" icon={addOutline} />
          Add Store
        </IonButton>
      </div>

      {error && <p style={{ color: 'red', padding: '0 16px' }}>{error}</p>}

      <IonList>
        {filtered.map((store) => (
          <IonItem key={store.id}>
            <IonLabel>
              <h2>{store.name}</h2>
              <IonNote>{store.address ?? 'No address'}</IonNote>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={store.is_active}
              onIonChange={() => handleToggleActive(store.id)}
            />
            <IonButton fill="clear" slot="end" onClick={() => handleEdit(store)}>
              <IonIcon icon={createOutline} />
            </IonButton>
            <IonButton
              fill="clear"
              slot="end"
              color="danger"
              onClick={() => setDeleteTargetId(store.id)}
            >
              <IonIcon icon={trashOutline} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>

      <IonAlert
        isOpen={deleteTargetId !== null}
        header="Delete Store"
        message="Are you sure you want to delete this store? This action cannot be undone."
        buttons={[
          { text: 'Cancel', role: 'cancel', handler: () => setDeleteTargetId(null) },
          { text: 'Delete', role: 'destructive', handler: handleDeleteConfirm },
        ]}
        onDidDismiss={() => setDeleteTargetId(null)}
      />

      <StoreForm key={selectedStore?.id ?? 'create'} />
    </div>
  )
}

export default StoreManagement
