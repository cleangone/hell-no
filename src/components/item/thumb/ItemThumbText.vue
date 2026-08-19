<template>
   <div v-if="showTitle||showArtist||showYear||fromUser||date" class="text-body-2"> 
      <div v-if="showTitle" :class="isXsSmThumb?'':'font-weight-bold'" >{{ itemName }}</div>
      <ItemArtistYear :item="item" :showArtist="showArtist" :showYear="showYear" :isSmThumb="isSmThumb"/>
      <UserDateText :user="fromUser" :date="date"/>
   </div>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemArtistYear   from '../ItemArtistYear.vue'
   import UserDateText     from '@/components/util/UserDateText.vue'
   import { handleError } from '@/utils/utils'
   import { ItemThumbOptions as ThumbOptions, ThumbSize } from '@/utils/constants'
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbText") })

   const props = defineProps({ 
      item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, bypassShowUser:Boolean, showDateViewed:Boolean })
   
   const userStore    = useUserStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   
   // const item = computed(() => props.item)
   const selectedFields = computed(() => {
      const fields = viewStore.itemThumbOptions
      return fields ? fields : [] // issue somehow related to local storage serialization
   })
   const showTitle        = computed(() => selectedFields.value.includes(ThumbOptions.TITLE))
   const showArtist       = computed(() => selectedFields.value.includes(ThumbOptions.ARTIST))
   const showYear         = computed(() => selectedFields.value.includes(ThumbOptions.YEAR))
   const showUser         = computed(() => !props.bypassShowUser && selectedFields.value.includes(ThumbOptions.USER))
   const showDateModified = computed(() => selectedFields.value.includes(ThumbOptions.UPDATED))
   
   const itemName = computed(() => { 
      const name = props.useAltName && props.item.alternateName?.length ? props.item.alternateName : props.item.name
      return props.useLocalName ? props.item.localName : name
   })

   const isXsSmThumb = computed(() => viewMgr.isXs && isSm(viewStore.thumbSize.xsSize))
   const isSmThumb   = computed(() => isSm(thumbSize.value))
   const thumbSize   = computed(() => viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size)
   const isSm = (size) => { return size == ThumbSize.SM }

   const fromUser = computed(() => showUser.value ? 
      { id: props.item.userId, name: props.item.username ? props.item.username : userStore.getUsername(props.item.userId) }
      : null 
   ) 

   const date = computed(() => { 
         if (props.showDateViewed)        { return props.item.dateViewed }
         else if (showDateModified.value) { return props.item.dateContentModified }
         else { return null }
   })
     
</script>

<style>
</style>
