import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore }  from './userStore'
import { useUserMgr }    from './userMgr'
import { useNotificationStore } from './notificationStore'
import { useGroupStore } from './groupStore'
import {  } from '@/utils/utils'
import { NotificationType, Route } from '@/utils/constants'
   

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

   function addGroupChatNotification(group, chat) {
      addGroupNotification({ 
         notificationType: NotificationType.GROUP_CHAT, 
         text: group.name + " group chat " + chat.name + " updated", 
         url: Route.GROUP.url + group.id  + "/" +  chat.id,
         groupId: group.id }) 
   }

   return { addGroupNotification, addGroupChatNotification }
})

