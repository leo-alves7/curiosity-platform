import { useEffect, useState } from 'react'
import { IonAlert, IonButton, IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import {
  fetchAdminCategoriesThunk,
  deleteCategoryThunk,
  openCategoryForm,
  setSelectedCategory,
} from '../../slices/adminSlice'
import CategoryForm from './CategoryForm'

function CategoryManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { categories, selectedCategory } = useSelector((state: RootState) => state.admin)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAdminCategoriesThunk())
  }, [dispatch])

  const handleEdit = (category: (typeof categories)[number]) => {
    dispatch(setSelectedCategory(category))
    dispatch(openCategoryForm('edit'))
  }

  const handleAddNew = () => {
    dispatch(setSelectedCategory(null))
    dispatch(openCategoryForm('create'))
  }

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      dispatch(deleteCategoryThunk(deleteTargetId))
      setDeleteTargetId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <IonButton onClick={handleAddNew}>
          <span slot="start" style={{ display: 'flex' }}>
            <Plus size={18} />
          </span>
          Add Category
        </IonButton>
      </div>

      <IonList>
        {categories.map((category) => (
          <IonItem key={category.id}>
            <IonLabel>
              <h2>{category.name}</h2>
              <IonNote>
                {category.slug}
                {category.icon && ` · ${category.icon}`}
                {category.color && ` · ${category.color}`}
              </IonNote>
            </IonLabel>
            <IonButton fill="clear" slot="end" onClick={() => handleEdit(category)}>
              <Pencil size={18} />
            </IonButton>
            <IonButton
              fill="clear"
              slot="end"
              color="danger"
              onClick={() => setDeleteTargetId(category.id)}
            >
              <Trash2 size={18} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>

      <IonAlert
        isOpen={deleteTargetId !== null}
        header="Delete Category"
        message="Are you sure you want to delete this category?"
        buttons={[
          { text: 'Cancel', role: 'cancel', handler: () => setDeleteTargetId(null) },
          { text: 'Delete', role: 'destructive', handler: handleDeleteConfirm },
        ]}
        onDidDismiss={() => setDeleteTargetId(null)}
      />

      <CategoryForm key={selectedCategory?.id ?? 'create'} />
    </div>
  )
}

export default CategoryManagement
