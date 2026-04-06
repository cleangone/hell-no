import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from '@/stores/userStore'
   
/*
   Admin
      id - user.id
*/
const ADMIN_TABLE = 'admins'

export const useAdminStore = defineStore('admin', () => {
   const userStore = useUserStore()
   function adminDoc(id) { return doc(db, ADMIN_TABLE, id) }
   
   const adminQuery = computed(() => userStore.userId && adminDoc(userStore.userId))
   const admin = useFirestore(adminQuery, null)
   const isAdmin = computed(() => admin.value ? true : false)

   const admins = useFirestore(collection(db, ADMIN_TABLE))  
   const adminIds = computed(() => { return admins.value ? admins.value.map((obj) => obj.id) : [] })
   
   return { isAdmin, adminIds }
})
