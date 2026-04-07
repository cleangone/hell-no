<template>
   <v-card :width="cardWidth" ref="cardRef" class="mb-5 d-flex flex-column text-center thumb-container" 
      :style="itemEditBackground" style="z-index: 1">
      <RouterLink :to="itemURL">
         <v-img :src="thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"></v-img>
      </RouterLink>
      <ItemThumbText :item="item" :origin="origin" 
         :useAltName="useAltName" :useLocalName="useLocalName" :showAdminIcons="showAdminIcons"/>
   </v-card>
   
   <ItemPopup v-if="popup && !showAdminIcons" :popupImage="popup"/>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemPopup     from '@/components/item/ItemPopup.vue'
   import ItemThumbText from './ItemThumbText.vue'
   import { backgroundColorStyle, handleError } from '@/utils/utils'
   
   const props = defineProps({ 
      item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, admin: Boolean
   })

   const userStore = useUserStore()
   const itemMgr = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbSingle") })

   const item     = computed(() => props.item)
   const itemURL  = computed(() => {   
      const id = props.item.linkId ? props.item.linkId : props.item.id
      return itemMgr.itemURL(id, props.origin, props.item.childNum)
   })
   const thumbUrl = computed(() => item.value.primaryImage.thumbUrl)
   const artist   = computed(() => item.value.primaryArtist ? item.value.primaryArtist.fullName : null)
   
   const aspectRatio = computed(() => itemMgr.itemAspectRatio(item.value))
   const cardWidth = computed(() => { 
      const targetWidth = Math.round(200 * aspectRatio.value)
      return targetWidth > 300 ? 300 : targetWidth
   })

   const showAdminIcons = computed(() => props.admin || viewStore.editInPlace && !item.value.isFeedItem && userStore.userId == item.value.userId)
   const itemEditBackground = computed(() => showAdminIcons.value ? backgroundColorStyle(props.item.state) : "") 

   const mouseover = () => {
      if (viewMgr.isMobile) { return }

      const mouseoverTime = Date.now()     
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = itemMgr.itemAspectRatio(item.value)
            popup.value = itemMgr.getPopupImage(
               item.value.name, artist.value, item.value.primaryImage.largeThumbUrl, boundingRect, aspectRatio)
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      popup.value = null 
   }
</script>

<style>
.thumb-container {
   position: relative;
}
</style>
