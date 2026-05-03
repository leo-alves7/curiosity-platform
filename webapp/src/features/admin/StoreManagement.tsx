import { useEffect, useState } from 'react'
import {
  IonAlert,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonToggle,
} from '@ionic/react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          placeholder={t('admin.searchPlaceholder')}
          style={{ flex: 1 }}
        />
        <IonButton onClick={handleAddNew}>
          <span slot="start" style={{ display: 'flex' }}>
            <Plus size={18} />
          </span>
          {t('admin.addStore')}
        </IonButton>
      </div>

      {error && <p style={{ color: 'red', padding: '0 16px' }}>{error}</p>}

      <IonList>
        {filtered.map((store) => (
          <IonItem key={store.id}>
            <IonLabel>
              <h2>{store.name}</h2>
              <IonNote>{store.address ?? t('admin.noAddress')}</IonNote>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={store.is_active}
              onIonChange={() => handleToggleActive(store.id)}
            />
            <IonButton fill="clear" slot="end" onClick={() => handleEdit(store)}>
              <Pencil size={18} />
            </IonButton>
            <IonButton
              fill="clear"
              slot="end"
              color="danger"
              onClick={() => setDeleteTargetId(store.id)}
            >
              <Trash2 size={18} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>

      <IonAlert
        isOpen={deleteTargetId !== null}
        header={t('admin.deleteStore')}
        message={t('admin.deleteStoreConfirm')}
        buttons={[
          {
            text: t('admin.deleteCancelButton'),
            role: 'cancel',
            handler: () => setDeleteTargetId(null),
          },
          {
            text: t('admin.deleteConfirmButton'),
            role: 'destructive',
            handler: handleDeleteConfirm,
          },
        ]}
        onDidDismiss={() => setDeleteTargetId(null)}
      />

      <StoreForm key={selectedStore?.id ?? 'create'} />
    </div>
  )
}

export default StoreManagement
