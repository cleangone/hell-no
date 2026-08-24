<template>
   <v-card :width="wallItem.wallImageWidth" ref="cardRef" color="transparent" flat class="d-flex flex-column text-center">
      <div v-if="topRow" class="position-relative">
         <v-card class="mt-7 bg-black">
            <div class="ma-1">
               <RouterLink :to="itemURL">
                  <v-img :src="wallItem.wallImageUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"/>
               </RouterLink>
               <div class="text-white">{{ wallItem.title }}</div>  
            </div> 
         </v-card>
         <RouterLink v-if="showAvatar" :to="userUrl" class="position-absolute top-0 left-0">
            <Avatar :user="user" :size="60" :toolTip="user.username" class="ml-2 pa-1 bg-black"/>
         </RouterLink>
      </div>
      <div v-else class="bg-black">
         <div class="ma-1">
            <RouterLink :to="itemURL">
               <v-img :src="wallItem.wallImageUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"/>
            </RouterLink>
         </div> 
      </div>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useSwipeStore } from './SwipeStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import Avatar            from '@/components/user/Avatar.vue'
   import { objAspectRatio } from '@/utils/utils'
   import { Emit, Route } from '@/utils/constants'
   
   const props = defineProps({ wallItem:Object, origin:String, row:Number, showAvatar:Boolean })
   const emit  = defineEmits([ Emit.POPUP ])

   const userStore  = useUserStore()
   const itemMgr    = useItemMgr()
   const swipeStore = useSwipeStore()
   const viewMgr    = useViewMgr()
   const cardRef = ref(null)
   const mouseleaveTime = ref(Date.now())   

   const topRow  = computed(() => props.wallItem.wallRow == 1)
   const itemURL = computed(() => itemMgr.itemURL(props.wallItem.itemId, props.origin, props.wallItem.childNum))
   const userId  = computed(() => props.wallItem.userId ?? null)
   const userUrl = computed(() => userId.value ? Route.USER.url + userId.value : null)
   const user    = computed(() => userId.value ? userStore.getUser(userId.value) : null)
   
   const getPopupImage = () => { 
      if (!cardRef.value) { return null }
      
      const thumbBoundingRect = cardRef.value.$el.getBoundingClientRect()
      if (thumbBoundingRect.y < 0) { return null } // thumbnail not visible to user 
      
      const popupAspectRatio = objAspectRatio(props.wallItem.popupDimensions)
      return itemMgr.getPopupImage(
         props.wallItem.name, 
         props.wallItem.artist ? props.wallItem.artist.fullName : null, 
         props.wallItem.popupUrl,
         thumbBoundingRect,  
         popupAspectRatio)
   }

   const mouseover = () => {
      if (viewMgr.isXs) { return }
      const mouseoverTime = Date.now()
      setTimeout(() => { 
         if (mouseoverTime > mouseleaveTime.value) { 
            swipeStore.setThumbMouseoverActive(true)
            emit(Emit.POPUP, getPopupImage())
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      swipeStore.setThumbMouseoverActive(false)
      emit(Emit.POPUP, null)
   }
</script>

<style>
</style>
