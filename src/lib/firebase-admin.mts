import { type App, getApps, initializeApp, applicationDefault } from 'firebase-admin/app'
import { type Auth, getAuth } from 'firebase-admin/auth'

let app: App | undefined

export const createFirebaseAuth = (projectId: string): Auth => {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: applicationDefault(),
      projectId,
    })
  } else {
    app = getApps()[0]
  }

  return getAuth(app)
}
