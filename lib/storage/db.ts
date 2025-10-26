interface User {
  id: string
  email: string
  password: string
  fullName: string
  createdAt: string
}

interface Exercise {
  id: string
  name: string
  category: string
  muscleGroup: string
  equipment: string
  difficulty: string
  description: string
  instructions: string[]
}

interface Workout {
  id: string
  userId: string
  name: string
  exercises: Array<{
    exerciseId: string
    sets: number
    reps: number
    rest: number
  }>
  createdAt: string
}

interface WorkoutSession {
  id: string
  userId: string
  workoutId: string
  completedAt: string
  duration: number
  exercises: Array<{
    exerciseId: string
    sets: Array<{
      reps: number
      weight: number
    }>
  }>
}

interface BodyMeasurement {
  id: string
  userId: string
  date: string
  weight?: number
  bodyFat?: number
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
}

class LocalDatabase {
  private dbName = "fitforge-db"
  private version = 1
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("exercises")) {
          const exerciseStore = db.createObjectStore("exercises", { keyPath: "id" })
          exerciseStore.createIndex("category", "category", { unique: false })
          exerciseStore.createIndex("muscleGroup", "muscleGroup", { unique: false })
        }
        if (!db.objectStoreNames.contains("workouts")) {
          const workoutStore = db.createObjectStore("workouts", { keyPath: "id" })
          workoutStore.createIndex("userId", "userId", { unique: false })
        }
        if (!db.objectStoreNames.contains("sessions")) {
          const sessionStore = db.createObjectStore("sessions", { keyPath: "id" })
          sessionStore.createIndex("userId", "userId", { unique: false })
        }
        if (!db.objectStoreNames.contains("measurements")) {
          const measurementStore = db.createObjectStore("measurements", { keyPath: "id" })
          measurementStore.createIndex("userId", "userId", { unique: false })
        }
      }
    })
  }

  async add<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const db = new LocalDatabase()
export type { User, Exercise, Workout, WorkoutSession, BodyMeasurement }
