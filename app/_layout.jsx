import React from 'react'
import { Slot } from 'expo-router'
import Toast from 'react-native-toast-message'

export default function RootLayout() {
  return (
    <>
      <Slot />   {/* This renders your actual pages (login, signup, tasks, etc) */}
      <Toast />  {/* Global toast provider - needed ONCE */}
    </>
  )
}
