import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useGroupStore } from '@/stores/groupStore'
import { isHidden } from '@/utils/utils' 
import { ImageType } from '@/utils/constants'
 
export const useGroupMgr = defineStore('groupmMgr', () => {   
   const groupStore = useGroupStore()   
   
   const myThumbGroups = computed(() => {
      const groups = []
      const myGroups = groupStore.myGroups ? groupStore.myGroups.filter(group => !isHidden(group)) : []
      for (const group of myGroups) {
         if (group.images?.length) {
            for (const image of group.images) {
               if (image.active) { 
                  groups.push(group) 
                  break
               }
            }
         } 
      }
      return groups
   })
   const myThumbGroupsExist = computed(() => myThumbGroups.value?.length > 0)
   
   function getUserMemberGroups(userId) {
      const userGroups = []
      if (groupStore.groups) {  
         for (const group of groupStore.groups) {
            if (group.userIds.includes(userId)) { userGroups.push(group) }
         }
      }
      return userGroups
   }

   function getGroupImage(group) {
      if (group?.images) {
         for (const image of group.images) {
            if (image.active && image.imageType == ImageType.GROUP) { return image }
         }
      }
      return null
   }
   
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
         if (groupStore.myGroupIdToGroup.has(groupId)) { groups.push(groupStore.myGroupIdToGroup.get(groupId)) }
      }
      return groups
   }

   function getCheckboxes(selectedIds) { 
      const checkboxContainer = { checkboxes: [], selectedGroups: [] }
      
      for (const group of groupStore.myGroups) {
         const isSelected = selectedIds.includes(group.id)
         if (isSelected) { checkboxContainer.selectedGroups.push(group) }
         checkboxContainer.checkboxes.push({ 
            id: group.id, 
            name: group.name, 
            isSelected: isSelected, 
         })
      }
      return checkboxContainer
   }
     
   return { myThumbGroups, myThumbGroupsExist, myGroupOptions, 
      getUserMemberGroups, getGroupImage, getMyOverlapGroups, getCheckboxes }
})
