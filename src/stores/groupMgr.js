import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useGroupStore } from '@/stores/groupStore'
 
export const useGroupMgr = defineStore('groupmMgr', () => {   
   const groupStore = useGroupStore()   
   
   function getUserMemberGroups(userId) {
      const userGroups = []
      if (groupStore.groups) {  
         for (const group of groupStore.groups) {
            if (group.userIds.includes(userId)) { userGroups.push(group) }
         }
      }
      return userGroups
   }
   
   const mySortedGroups = computed(() => { 
      const groups = groupStore.myGroups ? groupStore.myGroups : []
      groups.sort((a, b) => a.name.localeCompare(b.name))
      return groups
   })

   const myGroupOptions = computed(() => { 
     const options = []
      for (const group of mySortedGroups.value) { 
         options.push({ title: group.name, value: group.id })
      }
      return options
   })

   function getMyOverlapGroups(groupIds) {
      const groups = []
      for (const groupId of groupIds) { 
         if (groupStore.groupIdToMyGroup.has(groupId)) { groups.push(groupStore.groupIdToMyGroup.get(groupId)) }
      }
      return groups
   }
  
   const groupIdToMyGroup = computed(() => groupStore.groupIdToMyGroup)
      
   return { mySortedGroups, myGroupOptions, groupIdToMyGroup, getUserMemberGroups, getMyOverlapGroups }
})
