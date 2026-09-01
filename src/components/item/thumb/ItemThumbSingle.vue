<template>
   <v-card :width="cardWidth" ref="cardRef" style="z-index: 1" :class="cardStyle"
         class="d-flex flex-column text-center thumb-container thumb-link">
      <RouterLink :to="itemURL">
         <v-img :src="thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"></v-img>
      </RouterLink>
      <ItemThumbText v-if="showText" :item="item" :origin="origin" :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
   </v-card>
   
   <ItemPopup v-if="popup" :popupImage="popup"/>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemPopup        from '@/components/item/ItemPopup.vue'
   import ItemThumbText    from './ItemThumbText.vue'
   import { handleError } from '@/utils/utils'
   import { Emit, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      item: Object, origin: String, size: String, useAltName: Boolean, useLocalName: Boolean, 
      bypassShowUser:Boolean, showDateViewed:Boolean, emitPopup: Boolean })
   const emit = defineEmits([ Emit.POPUP ])
   
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbSingle") })

   const item    = computed(() => props.item)
   const itemURL = computed(() => {   
      const id = props.item.linkId ? props.item.linkId : props.item.id
      return itemMgr.itemURL(id, props.origin, props.item.childNum)
   })
   const thumbUrl    = computed(() => item.value.primaryImage.thumbUrl)
   const artist      = computed(() => item.value.primaryArtist ? item.value.primaryArtist.fullName : null)
   const thumbSize   = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size))
   const showText    = computed(() => thumbSize.value != ThumbSize.IMG)
   const cardStyle   = computed(() => (showText.value ? "mb-5" : "mb-2") + (thumbSize.value == ThumbSize.IMG ? "" : " pa-1")) 
   const cardWidth   = computed(() => itemMgr.getItemWidth(item.value, 
                                          viewMgr.getTargetThumbHeight(thumbSize.value), 
                                          viewMgr.getItemMaxLandscapeWidth(thumbSize.value))) 

   const mouseover = () => {
      if (viewMgr.isMobile) { return }

      const mouseoverTime = Date.now()     
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = itemMgr.itemAspectRatio(item.value)
            const popupImage = itemMgr.getPopupImage(
               item.value.name, artist.value, item.value.primaryImage.largeThumbUrl, boundingRect, aspectRatio)
         
            if (props.emitPopup) { emit(Emit.POPUP, popupImage) }
            else { popup.value = popupImage }
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      if (props.emitPopup) { emit(Emit.POPUP, null) }
      else { popup.value = null }
   }
</script>

<style>
.thumb-container {
   position: relative;
}
</style>
