import { useState } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import {
  closeCategoryForm,
  createCategoryThunk,
  updateCategoryThunk,
} from '../../slices/adminSlice'
import type { CategoryCreate, CategoryUpdate } from '@/types/category'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function CategoryForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { categoryForm, selectedCategory } = useSelector((state: RootState) => state.admin)

  const [name, setName] = useState(selectedCategory?.name ?? '')
  const [slug, setSlug] = useState(selectedCategory?.slug ?? '')
  const [icon, setIcon] = useState(selectedCategory?.icon ?? '')
  const [color, setColor] = useState(selectedCategory?.color ?? '')
  const [nameError, setNameError] = useState('')
  const [slugError, setSlugError] = useState('')

  const handleNameChange = (value: string) => {
    setName(value)
    if (!selectedCategory) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = async () => {
    let valid = true
    if (!name.trim()) {
      setNameError('Name is required')
      valid = false
    } else {
      setNameError('')
    }
    if (!slug.trim()) {
      setSlugError('Slug is required')
      valid = false
    } else {
      setSlugError('')
    }
    if (!valid) return

    if (categoryForm.mode === 'create') {
      const data: CategoryCreate = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon || null,
        color: color || null,
      }
      await dispatch(createCategoryThunk(data))
    } else if (selectedCategory) {
      const data: CategoryUpdate = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon || null,
        color: color || null,
      }
      await dispatch(updateCategoryThunk({ id: selectedCategory.id, data }))
    }
  }

  const handleCancel = () => {
    dispatch(closeCategoryForm())
  }

  return (
    <IonModal isOpen={categoryForm.isOpen} onDidDismiss={handleCancel}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{categoryForm.mode === 'create' ? 'Add Category' : 'Edit Category'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCancel}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Name *</IonLabel>
          <IonInput
            value={name}
            onIonChange={(e) => handleNameChange(e.detail.value ?? '')}
            placeholder="Category name"
          />
          {nameError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{nameError}</p>}
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Slug *</IonLabel>
          <IonInput
            value={slug}
            onIonChange={(e) => setSlug(e.detail.value ?? '')}
            placeholder="category-slug"
          />
          {slugError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{slugError}</p>}
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Icon</IonLabel>
          <IonInput
            value={icon}
            onIonChange={(e) => setIcon(e.detail.value ?? '')}
            placeholder="Icon name (e.g. restaurant)"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Color</IonLabel>
          <IonInput
            value={color}
            onIonChange={(e) => setColor(e.detail.value ?? '')}
            placeholder="#FF5733"
          />
        </IonItem>
        <IonButton expand="block" onClick={handleSubmit} style={{ marginTop: 16 }}>
          {categoryForm.mode === 'create' ? 'Create Category' : 'Save Changes'}
        </IonButton>
      </IonContent>
    </IonModal>
  )
}

export default CategoryForm
