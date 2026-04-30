<template>
   <div v-if="showTitle || showArtist" class="text-body-2"> 
      <div v-if="showTitle" showTitle class="font-weight-bold">{{ itemName }}</div>
      <ItemArtistYear v-if="showArtist" :item="item"/>
   </div>
   <UserDateText :user="fromUser" :date="showDateModified ? item.dateContentModified : null" class="text-body-2"/>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import ItemArtistYear   from '../ItemArtistYear.vue'
   import UserDateText     from '@/components/util/UserDateText.vue'
   import { handleError }  from '@/utils/utils'
   import { ItemThumbOptions as ThumbOptions } from '@/utils/constants'
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbText") })

   const props = defineProps({ item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, bypassShowUser:Boolean })
   const userStore    = useUserStore()
   const profileStore = useProfileStore()
   const viewStore    = useViewStore()
   
   const item = computed(() => props.item)
   const selectedFields = computed(() => {
      const fields = viewStore.itemThumbOptions
      return fields ? fields : [] // issue somehow related to local storage serialization
   })
   const showTitle        = computed(() => selectedFields.value.includes(ThumbOptions.TITLE))
   const showArtist       = computed(() => selectedFields.value.includes(ThumbOptions.ARTIST))
   const showUser         = computed(() => !props.bypassShowUser && selectedFields.value.includes(ThumbOptions.USER))
   const showDateModified = computed(() => selectedFields.value.includes(ThumbOptions.UPDATED))
   
   const itemName = computed(() => { 
      const name = props.useAltName && item.value.alternateName?.length ? item.value.alternateName : item.value.name
      return props.useLocalName ? item.value.localName : name
   })

   const fromUser = computed(() => { 
      if (showUser.value) {
         if (item.value.profileId) { return { id: item.value.profileId, name: profileStore.getUsername(item.value.profileId) }}
         else { return { id: item.value.userId, 
            name: item.value.username ? item.value.username : userStore.getUsername(item.value.userId) }}
      }
      return null 
   }) 
</script>

<style>
</style>
