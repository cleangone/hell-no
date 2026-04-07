<template>
   <div v-if="showTitle || showArtist" class="text-body-2 mb-2"> 
      <div v-if="showTitle" showTitle class="font-weight-bold">{{ itemName }}</div>
      <ItemArtistYear v-if="showArtist" :item="item"/>
   </div>
   <div v-if="showUser || showDateModified" class="text-body-2 mt-2">
      <div v-if="fromUser" class="text-left ms-1">
         From <RouterLink :to="URL.USER + fromUser.id">{{ fromUser.name }}</RouterLink>
      </div>
      <GroupNames :groups="item.groups" class="text-left ms-1"/> <!-- only populated for Feed -->
      <div v-if="showDateModified" class="mb-2">
         {{ displayDate(item.dateContentModified) }}
      </div>
   </div>
   <div v-if="showAdminIcons" class="mt-auto text-right">
      <EditButton @click="showEditDialog=true" ></EditButton>
   </div>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditItemDialog :item="item" @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemArtistYear from '../ItemArtistYear.vue'
   import EditItemDialog from '../crud/EditItemDialog.vue'
   import GroupNames     from '@/components/group/GroupNames.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import { displayDate } from '@/utils/dateUtils'
   import { handleError } from '@/utils/utils'
   import { ThumbField, URL } from '@/utils/constants'
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbText") })

   const props = defineProps({ 
      item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, showAdminIcons: Boolean
   })
   const userStore = useUserStore()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const showEditDialog = ref(false)
   
   const item = computed(() => props.item)
   const selectedFields = computed(() => {
      const fields = viewStore.visibleThumbFields.get(props.origin)
      return fields ? fields : [] // issue somehow related to local storage serialization
   })
   const showTitle        = computed(() => selectedFields.value.includes(ThumbField.TITLE))
   const showArtist       = computed(() => selectedFields.value.includes(ThumbField.ARTIST))
   const showDateModified = computed(() => selectedFields.value.includes(ThumbField.DATE_UPDATED))
   const showUser         = computed(() => selectedFields.value.includes(ThumbField.USER) && !viewMgr.solo)
   
   const itemName = computed(() => { 
      const name = props.useAltName && item.value.alternateName?.length ? item.value.alternateName : item.value.name
      return props.useLocalName ? item.value.localName : name
   })

   const fromUser = computed(() => { 
      return showUser.value ? 
         { id: item.value.userId, name: item.value.username ? item.value.username : userStore.getUsername(item.value.userId) } : 
         null 
   }) 
</script>

<style>
</style>
