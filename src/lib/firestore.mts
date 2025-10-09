import { Firestore } from '@google-cloud/firestore'

export const createFirestore = (projectId: string): Firestore =>
  new Firestore({
    projectId,
  })
