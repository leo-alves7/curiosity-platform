import { useRef, useState } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { AppDispatch, RootState } from '../../store'
import {
  closeStoreForm,
  createStoreThunk,
  updateStoreThunk,
  uploadStoreImageThunk,
} from '../../slices/adminSlice'
import type { StoreCreate, StoreUpdate } from '@/types/store'
import MapPicker from './MapPicker'

function StoreForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { storeForm, selectedStore, categories } = useSelector((state: RootState) => state.admin)

  const [name, setName] = useState(selectedStore?.name ?? '')
  const [description, setDescription] = useState(selectedStore?.description ?? '')
  const [address, setAddress] = useState(selectedStore?.address ?? '')
  const [lat, setLat] = useState<number | null>(selectedStore?.lat ?? null)
  const [lng, setLng] = useState<number | null>(selectedStore?.lng ?? null)
  const [categoryId, setCategoryId] = useState(selectedStore?.category_id ?? '')
  const [isActive, setIsActive] = useState(selectedStore?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(selectedStore?.image_url ?? '')
  const [nameError, setNameError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(t('admin.nameRequired'))
      return
    }
    setNameError('')

    if (storeForm.mode === 'create') {
      const data: StoreCreate = {
        name: name.trim(),
        description: description || null,
        address: address || null,
        lat,
        lng,
        category_id: categoryId || null,
        is_active: isActive,
      }
      const result = await dispatch(createStoreThunk(data))
      if (createStoreThunk.fulfilled.match(result) && imageFile) {
        await dispatch(uploadStoreImageThunk({ id: result.payload.id, file: imageFile }))
      }
    } else if (selectedStore) {
      const data: StoreUpdate = {
        name: name.trim(),
        description: description || null,
        address: address || null,
        lat,
        lng,
        category_id: categoryId || null,
        is_active: isActive,
      }
      await dispatch(updateStoreThunk({ id: selectedStore.id, data }))
      if (imageFile) {
        await dispatch(uploadStoreImageThunk({ id: selectedStore.id, file: imageFile }))
      }
    }
  }

  const handleCancel = () => {
    dispatch(closeStoreForm())
  }

  return (
    <IonModal isOpen={storeForm.isOpen} onDidDismiss={handleCancel}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {storeForm.mode === 'create' ? t('admin.addStore') : t('admin.editStore')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCancel}>{t('admin.cancel')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">{t('admin.nameLabel')}</IonLabel>
          <IonInput
            value={name}
            onIonChange={(e) => setName(e.detail.value ?? '')}
            placeholder={t('admin.namePlaceholder')}
          />
          {nameError && (
            <IonText color="danger">
              <p style={{ fontSize: '0.8rem' }}>{nameError}</p>
            </IonText>
          )}
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('admin.descriptionLabel')}</IonLabel>
          <IonTextarea
            value={description}
            onIonChange={(e) => setDescription(e.detail.value ?? '')}
            rows={3}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('admin.addressLabel')}</IonLabel>
          <IonInput value={address} onIonChange={(e) => setAddress(e.detail.value ?? '')} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('admin.categoryLabel')}</IonLabel>
          <IonSelect
            value={categoryId}
            onIonChange={(e) => setCategoryId(e.detail.value)}
            placeholder={t('addStore.categoryPlaceholder')}
          >
            <IonSelectOption value="">{t('admin.categoryNone')}</IonSelectOption>
            {categories.map((cat) => (
              <IonSelectOption key={cat.id} value={cat.id}>
                {cat.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <MapPicker
          lat={lat}
          lng={lng}
          onChange={(newLat, newLng) => {
            setLat(newLat)
            setLng(newLng)
          }}
        />
        <IonItem>
          <IonLabel>{t('admin.activeLabel')}</IonLabel>
          <IonToggle
            checked={isActive}
            onIonChange={(e) => setIsActive(e.detail.checked)}
            slot="end"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('admin.imageLabel')}</IonLabel>
          {imagePreview && (
            <img src={imagePreview} alt="preview" style={{ maxHeight: 120, marginTop: 8 }} />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <IonButton fill="outline" onClick={() => fileInputRef.current?.click()}>
            {imagePreview ? t('admin.changeImage') : t('admin.uploadImage')}
          </IonButton>
        </IonItem>
        <IonButton expand="block" onClick={handleSubmit} style={{ marginTop: 16 }}>
          {storeForm.mode === 'create' ? t('admin.createStore') : t('admin.saveChanges')}
        </IonButton>
      </IonContent>
    </IonModal>
  )
}

export default StoreForm
