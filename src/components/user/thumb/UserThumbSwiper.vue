<template>
   <swiper slides-per-view="auto" :space-between="slideSpacing" loop>
      <swiper-slide v-for="user in users" :key="user.id" class="dynamic-slide-width mr-3">
         <UserThumb :user="user" :isSelected="selectedUserId==user.id" emitSelect @select="selectUser(user)"/>
      </swiper-slide>
   </swiper>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import UserThumb      from './UserThumb.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ users: Array })
   const emit  = defineEmits([ Emit.USER_ID ])
   
   const viewMgr        = useViewMgr()
   const selectedUserId = ref(null)

   const slideSpacing = computed(() => viewMgr.isXs ? 5 : 10)
   
   const selectUser = (user) => { 
      selectedUserId.value = user.id == selectedUserId.value  ? null : user.id
      emit(Emit.USER_ID, selectedUserId.value) 
   }
</script>

<style>
.dynamic-slide-width {
  width: max-content; /* Shrinks the slide to fit the inner UserThumb content */
  display: inline-block; /* Prevents block-level 100% width stretching */
}
</style>
