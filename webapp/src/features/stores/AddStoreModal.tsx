import { useEffect, useState } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import AddStoreForm, { type AddStoreFormData } from './AddStoreForm'
import { useAnalytics } from '@/hooks/useAnalytics'
import { fetchCategories } from '@/api/categories'
import { createStore, uploadStoreImage } from '@/api/stores'
import { fetchStoresAndCategories } from '@/slices/storesSlice'
import { resetAddStore, type PinLocation } from '@/slices/uiSlice'
import type { CategoryResponse } from '@/types/category'
import type { StoreResponse } from '@/types/store'
import type { AppDispatch } from '@/store'

interface AddStoreModalProps {
  isOpen: boolean
  pinLocation: PinLocation | null
  onClose: () => void
  onStoreCreated?: (store: StoreResponse) => void
}

function AddStoreModal({ isOpen, pinLocation, onClose, onStoreCreated }: AddStoreModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { trackStoreAdded } = useAnalytics()
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState(false)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    fetchCategories()
      .then((items) => {
        if (!cancelled) setCategories(items)
      })
      .catch(() => {
        if (!cancelled) setErrorToast(t('addStore.failedToLoadCategories'))
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleClose = () => {
    setSubmitError(null)
    dispatch(resetAddStore())
    onClose()
  }

  const handleSubmit = async (data: AddStoreFormData) => {
    if (!pinLocation) {
      setSubmitError('Pin location is required')
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let store = await createStore({
        name: data.name,
        category_id: data.categoryId,
        lat: pinLocation.lat,
        lng: pinLocation.lng,
      })
      if (data.photo) {
        store = await uploadStoreImage(store.id, data.photo)
      }
      setSuccessToast(true)
      trackStoreAdded()
      await dispatch(fetchStoresAndCategories())
      onStoreCreated?.(store)
      dispatch(resetAddStore())
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create store'
      setSubmitError(message)
      setErrorToast(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('addStore.modalTitle')}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleClose} disabled={isSubmitting}>
                {t('addStore.cancel')}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <AddStoreForm
            pinLocation={pinLocation}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        </IonContent>
      </IonModal>
      <IonToast
        isOpen={successToast}
        message={t('addStore.created')}
        duration={2500}
        color="success"
        onDidDismiss={() => setSuccessToast(false)}
      />
      <IonToast
        isOpen={errorToast !== null}
        message={errorToast ?? ''}
        duration={3000}
        color="danger"
        onDidDismiss={() => setErrorToast(null)}
      />
    </>
  )
}

export default AddStoreModal
