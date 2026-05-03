import { IonInput, IonItem, IonLabel } from '@ionic/react'
import { useTranslation } from 'react-i18next'

interface MapPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}

function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const { t } = useTranslation()
  const handleLat = (value: string | null | undefined) => {
    const parsed = value ? parseFloat(value) : null
    onChange(isNaN(parsed as number) ? null : parsed, lng)
  }

  const handleLng = (value: string | null | undefined) => {
    const parsed = value ? parseFloat(value) : null
    onChange(lat, isNaN(parsed as number) ? null : parsed)
  }

  return (
    <>
      <IonItem>
        <IonLabel position="stacked">{t('admin.latLabel')}</IonLabel>
        <IonInput
          type="number"
          value={lat ?? ''}
          min="-90"
          max="90"
          step="0.0000001"
          onIonChange={(e) => handleLat(e.detail.value)}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">{t('admin.lngLabel')}</IonLabel>
        <IonInput
          type="number"
          value={lng ?? ''}
          min="-180"
          max="180"
          step="0.0000001"
          onIonChange={(e) => handleLng(e.detail.value)}
        />
      </IonItem>
    </>
  )
}

export default MapPicker
