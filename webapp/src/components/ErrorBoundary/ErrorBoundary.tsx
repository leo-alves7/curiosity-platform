import React from 'react'
import { IonApp, IonContent, IonText } from '@ionic/react'
import * as Sentry from '@sentry/react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <IonApp>
          <IonContent>
            <IonText>
              <p>Something went wrong. Please refresh the page.</p>
            </IonText>
          </IonContent>
        </IonApp>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
