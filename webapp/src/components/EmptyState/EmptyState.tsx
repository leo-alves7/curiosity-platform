import Lottie from 'lottie-react'
import { PackageOpen } from 'lucide-react'
import { IonText } from '@ionic/react'

interface EmptyStateProps {
  title: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData?: any
}

function EmptyState({ title, description, animationData }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          style={{ width: 160, height: 160 }}
          aria-hidden="true"
        />
      ) : (
        <PackageOpen
          size={64}
          color="var(--ion-color-medium)"
          aria-hidden="true"
          style={{ marginBottom: 16 }}
        />
      )}
      <IonText color="dark">
        <h3 style={{ margin: '12px 0 6px', fontSize: 18, fontWeight: 600 }}>{title}</h3>
      </IonText>
      {description && (
        <IonText color="medium">
          <p style={{ margin: 0, fontSize: 14 }}>{description}</p>
        </IonText>
      )}
    </div>
  )
}

export default EmptyState
