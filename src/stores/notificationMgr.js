import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore }  from './userStore'
import { useUserMgr }    from './userMgr'
import { useNotificationStore } from './notificationStore'
import { useGroupStore } from './groupStore'
import {  } from '@/utils/utils'

export const useNotificationMgr = defineStore('notificationMgr', () => {
   const userStore = useUserStore()
   const userMgr = useUserMgr()
   const notificationStore = useNotificationStore()
   const groupStore = useGroupStore()   
   
   function addGroupNotification(notification) {
      const userIds = groupStore.getUserIds(notification.groupId).filter(id => id != userStore.userId)
      const users = userMgr.getUsers(userIds)
      const notificationUsers = []
      for (const user of users) { 
         console.log(user.id, user.settings)
         const notificationSetting = user.settings && notification.notificationType in user.settings ?  
            user.settings[notification.notificationType] : null
         if (notificationSetting) { notificationUsers.push(user)}
      }  

      for (const user of notificationUsers) { 
         notificationStore.addNotification({ ...notification, userId: user.id })
      }
   }

   return { addGroupNotification }
})

