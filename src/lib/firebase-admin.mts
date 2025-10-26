import { type App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { type Auth, getAuth } from 'firebase-admin/auth'

let app: App | undefined

export const createFirebaseAuth = (projectId: string): Auth => {
  // Initialize app if not already initialized
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId,
        // In production, credentials come from Application Default Credentials
      }),
      projectId,
    })
  } else {
    app = getApps()[0]
  }

  return getAuth(app)
}
