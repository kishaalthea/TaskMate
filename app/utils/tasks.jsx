import { auth, db } from '../../firebaseConfig'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

// fetch all tasks for current user
export async function fetchTasks() {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  const colRef = collection(db, 'users', user.uid, 'tasks')
  const snap = await getDocs(colRef)

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }))
}

// create a new task
export async function createTask(task) {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  const colRef = collection(db, 'users', user.uid, 'tasks')
  const docRef = await addDoc(colRef, {
    ...task,
    createdAt: serverTimestamp(),
  })

  return { id: docRef.id, ...task }
}

// update an existing task
export async function updateTask(id, updates) {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  const ref = doc(db, 'users', user.uid, 'tasks', id)
  await updateDoc(ref, updates)

  return { id, ...updates }
}

// delete a task
export async function deleteTask(id) {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  const ref = doc(db, 'users', user.uid, 'tasks', id)
  await deleteDoc(ref)

  return true
}
