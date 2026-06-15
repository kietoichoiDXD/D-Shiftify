import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

import config from '@/core/configs/env'

let app: FirebaseApp | null = null
let auth: Auth | null = null

export const isFirebaseConfigured = (): boolean =>
  Boolean(
    config.firebase.apiKey &&
      config.firebase.authDomain &&
      config.firebase.projectId &&
      config.firebase.appId
  )

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null

  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey: config.firebase.apiKey,
          authDomain: config.firebase.authDomain,
          projectId: config.firebase.projectId,
          appId: config.firebase.appId
        })
  }

  return app
}

export const getFirebaseAuth = (): Auth | null => {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null

  if (!auth) {
    auth = getAuth(firebaseApp)
  }

  return auth
}

export const getFirebaseIdToken = async (): Promise<string | null> => {
  const firebaseAuth = getFirebaseAuth()
  const user = firebaseAuth?.currentUser

  if (!user) return null

  return user.getIdToken()
}
