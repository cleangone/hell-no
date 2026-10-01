import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid, toSortedDateCreatedDesc } from '@/utils/utils'
import { NotificationStatus } from '@/utils/constants'

/*
   Notification
      id
      status: NotificationStatus: READ, UNREAD
      notificationType: NotificationType: GROUP_ITEM, GROUP_CHAT
      userId
      groupId 
      itemId
      text
      url
      dateCreated
*/

const TABLE = 'notifications'

export const useNotificationStore = defineStore('notification', () => {
   const userStore = useUserStore()
   const notificationCollection = collection(db, TABLE)
   function notificationDoc(id) { return doc(db, TABLE, id) }

   const notifications = useFirestore(notificationCollection, [])      
   const userIdToNotifications = computed(() => {
      const map = new Map()
      for (const notification of notifications.value) {
         if (!map.has(notification.userId)) { map.set(notification.userId, []) }
         map.get(notification.userId).push(notification)
      }
      return map
   })

   const myNotificationsQuery  = computed(() => userStore.userId && query(notificationCollection, where('userId', '==', userStore.userId)) )
   const myRawNotifications    = useFirestore(myNotificationsQuery, [])
   const myNotifications       = computed(() => toSortedDateCreatedDesc(myRawNotifications.value))
   const myActiveNotifications = computed(() => myNotifications.value.filter(notification => notification.status == NotificationStatus.ACTIVE))

   function addNotification(notification) {
      const notificationToSet = { ...notification, id: dateUuid(), status: NotificationStatus.ACTIVE, dateCreated: serverTimestamp() } 
         
      const existingNotifications = userIdToNotifications.value.get(notification.userId)
      const duplicates = existingNotifications ? 
         existingNotifications.filter(existing => 
            existing.notificationType == notificationToSet.notificationType &&
            existing.status           == notificationToSet.status &&
            existing.userId           == notificationToSet.userId &&
            existing.groupId          == notificationToSet.groupId &&
            existing.text             == notificationToSet.text)
         : []

      if (duplicates.length) { console.log("Bypassing duplicate notification") }
      else { setDoc(notificationDoc(notificationToSet.id), notificationToSet) }
   }

   function setInactive(id) { updateDoc(notificationDoc(id), { status: NotificationStatus.INACTIVE }) }

   function deleteNotification(id) { deleteDoc(doc(notificationCollection, id)) }

   function deleteNotifications(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(notificationCollection, id))
      }
      batch.commit()
   }

   return { myNotifications, myActiveNotifications, addNotification, setInactive, deleteNotification, deleteNotifications }
})

