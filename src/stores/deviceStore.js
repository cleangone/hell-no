import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
   
/*
   Device
      id
      name
      userId
      dateCreated
      dateModified
*/

const TABLE = 'devices'

export const useDeviceStore = defineStore('deviceStore', () => {
   const userStore = useUserStore()
   
   const deviceCollection = collection(db, TABLE)
   function deviceDoc(id) { return doc(db, TABLE, id) }
   
   const devices = useFirestore(deviceCollection)      
   const deviceIdToDevice = computed(() => { return devices.value ? new Map(devices.value.map((obj) => [obj.id, obj])) : new Map() })
   function getDeviceName(id) { return deviceIdToDevice.value.has(id) ? deviceIdToDevice.value.get(id).name : null }

   const myDeviceQuery = computed(() => userStore.userId && query(deviceCollection, where('userId', '==', userStore.userId)))
   const myDevices = useFirestore(myDeviceQuery, [])
   const deviceIdToMyDevice = computed(() => { return new Map(myDevices.value.map((obj) => [obj.id, obj])) })
  
   function setDevice(device) {
      const deviceToSet = { ...device, dateCreated:serverTimestamp(), dateModified:serverTimestamp() }
      setDoc(deviceDoc(deviceToSet.id), deviceToSet)
   }

   function updateDevice(device) { 
      updateDoc(deviceDoc(device.id), { ...device, dateModified: serverTimestamp() }) 
   }

   function deleteDevice(id) {
      deleteDoc(doc(deviceCollection, id))
   }

   return { getDeviceName, myDevices, deviceIdToMyDevice, setDevice, updateDevice, deleteDevice }
})
