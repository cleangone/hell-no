import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid, toSortedDateCreatedDesc } from '@/utils/utils'

/*
   Notification
      id
      status: NotifyStatus: READ, UNREAD
      userId
      text
      dateCreated
*/

const TABLE = 'notifications'
const NotificationStatus = { READ: 'Read', UNREAD: 'Read' }

export const useNotificationStore = defineStore('notification', () => {
   const userStore = useUserStore()
   const notificationCollection = collection(db, TABLE)
   function notificationDoc(id) { return doc(db, TABLE, id) }

   // const notifications = useFirestore(notificationCollection, [])      
   // const userIdToNotifs = computed(() => {
   //    const map = new Map()
   //    for (const notification of notifications.value) {
   //       if (!map.has(notification.userId)) { map.set(notification.userId, []) }
   //       map.get(notification.userId).push(notification)
   //    }
   //    return map
   // })

   const myNotificationsQuery  = computed(() => userStore.userId && query(notificationCollection, where('userId', '==', userStore.userId)) )
   const myRawNotifications    = useFirestore(myNotificationsQuery, [])
   const myNotifications       = computed(() => toSortedDateCreatedDesc(myRawNotifications.value))
   const myUnreadNotifications = computed(() => myNotifications.value.filter(notification => notification.status == NotificationStatus.UNREAD))

   function addNotification(notification) {
      const notificationToSet = { ...notification, id: dateUuid(), status: NotifStatus.UNREAD, dateCreated: serverTimestamp() } 
      setDoc(notificationDoc(notificationToSet.id), notificationToSet)
   }

   function setStatusRead(id)      { updateDoc(notificationDoc(id), { status: NotifStatus.READ }) }
   function deleteNotification(id) { deleteDoc(doc(notificationCollection, id)) }

   return { myNotifications, myUnreadNotifications, addNotification, setStatusRead, deleteNotification }
})

