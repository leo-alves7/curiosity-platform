import { useRef, useState } from 'react'
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react'
import type { CategoryResponse } from '@/types/category'
import type { PinLocation } from '@/slices/uiSlice'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const NAME_MIN = 2
const NAME_MAX = 100

export interface AddStoreFormData {
  name: string
  categoryId: string
  photo: File | null
}

interface AddStoreFormProps {
  pinLocation: PinLocation | null
  categories: CategoryResponse[]
  onSubmit: (data: AddStoreFormData) => void
  onCancel: () => void
  isSubmitting: boolean
  error: string | null
}

function AddStoreForm({
  pinLocation,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: AddStoreFormProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [nameError, setNameError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setPhoto(null)
      setPhotoError('')
      return
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file')
      setPhoto(null)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPhotoError('Image must be smaller than 5MB')
      setPhoto(null)
      return
    }
    setPhotoError('')
    setPhoto(file)
  }

  const validate = (): boolean => {
    let valid = true
    const trimmed = name.trim()
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setNameError(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters`)
      valid = false
    } else {
      setNameError('')
    }
    if (!categoryId) {
      setCategoryError('Category is required')
      valid = false
    } else {
      setCategoryError('')
    }
    return valid
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({ name: name.trim(), categoryId, photo })
  }

  return (
    <div>
      {pinLocation && (
        <IonItem lines="none">
          <IonLabel>
            <p>
              Pin: {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
            </p>
          </IonLabel>
        </IonItem>
      )}
      <IonItem>
        <IonLabel position="stacked">Name *</IonLabel>
        <IonInput
          value={name}
          onIonInput={(e) => setName(e.detail.value ?? '')}
          placeholder="Store name"
          maxlength={NAME_MAX}
          disabled={isSubmitting}
        />
        {nameError && (
          <IonText color="danger">
            <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>{nameError}</p>
          </IonText>
        )}
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Category *</IonLabel>
        <IonSelect
          value={categoryId}
          onIonChange={(e) => setCategoryId(e.detail.value ?? '')}
          placeholder="Select category"
          disabled={isSubmitting}
          aria-label="Category"
        >
          {categories.map((category) => (
            <IonSelectOption key={category.id} value={category.id}>
              {category.name}
            </IonSelectOption>
          ))}
        </IonSelect>
        {categoryError && (
          <IonText color="danger">
            <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>{categoryError}</p>
          </IonText>
        )}
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Photo (optional)</IonLabel>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={isSubmitting}
          aria-label="Photo"
          style={{ marginTop: 8 }}
        />
        {photoError && (
          <IonText color="danger">
            <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>{photoError}</p>
          </IonText>
        )}
      </IonItem>
      {error && (
        <IonText color="danger">
          <p style={{ padding: '0 16px' }}>{error}</p>
        </IonText>
      )}
      <div style={{ display: 'flex', gap: 8, padding: 16 }}>
        <IonButton fill="outline" expand="block" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </IonButton>
        <IonButton expand="block" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Store'}
        </IonButton>
      </div>
    </div>
  )
}

export default AddStoreForm
