import { IonFab, IonFabButton, IonIcon } from '@ionic/react'
import { add, close } from 'ionicons/icons'
import { useDispatch, useSelector } from 'react-redux'
import { resetAddStore, selectIsAddingStore, setIsAddingStore } from '@/slices/uiSlice'
import type { AppDispatch } from '@/store'

interface AddStoreButtonProps {
  bottomOffset?: number
}

function AddStoreButton({ bottomOffset = 0 }: AddStoreButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
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
        title={isAddingStore ? 'Cancel adding store' : 'Add store'}
        aria-label={isAddingStore ? 'Cancel adding store' : 'Add store'}
        onClick={handleClick}
      >
        <IonIcon icon={isAddingStore ? close : add} />
      </IonFabButton>
    </IonFab>
  )
}

export default AddStoreButton
