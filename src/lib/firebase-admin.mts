import { type App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { type Auth, getAuth } from 'firebase-admin/auth'

let app: App | undefined

type CreateFirebaseAuthProps = {
  projectId: string
  apiKey: string
  authDomain: string
}

export const createFirebaseAuth = ({
  apiKey,
  authDomain,
  projectId,
}: CreateFirebaseAuthProps): Auth => {
  if (getApps().length === 0) {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
    })
  } else {
    app = getApps()[0]
  }

  return getAuth(app)
}
