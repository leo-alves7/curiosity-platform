import { IonFab, IonFabButton } from '@ionic/react'
import { Plus, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { resetAddStore, selectIsAddingStore, setIsAddingStore } from '@/slices/uiSlice'
import type { AppDispatch } from '@/store'

interface AddStoreButtonProps {
  bottomOffset?: number
}

function AddStoreButton({ bottomOffset = 0 }: AddStoreButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const isAddingStore = useSelector(selectIsAddingStore)

  const handleClick = () => {
    if (isAddingStore) {
      dispatch(resetAddStore())
    } else {
      dispatch(setIsAddingStore(true))
    }
  }

  return (
    <IonFab style={{ position: 'absolute', bottom: `${bottomOffset + 16}px`, right: '16px' }}>
      <IonFabButton
        color={isAddingStore ? 'danger' : 'primary'}
        title={isAddingStore ? t('addStore.cancelAdding') : t('addStore.addStore')}
        aria-label={isAddingStore ? t('addStore.cancelAdding') : t('addStore.addStore')}
        onClick={handleClick}
      >
        {isAddingStore ? <X size={20} /> : <Plus size={20} />}
      </IonFabButton>
    </IonFab>
  )
}

export default AddStoreButton
