<template>
   <ToolTipHover v-if="toolTip" :text="toolTip" v-slot="{ props: slotProps }">
      <AvatarImage v-if="avatar" v-bind="slotProps" :image="avatar" :size="size"/>
   </ToolTipHover>
   <AvatarImage v-else-if="avatar" :image="avatar" :size="size"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useUserMgr } from '@/stores/userMgr'
   import AvatarImage    from './AvatarImage.vue'
   import ToolTipHover   from '@/components/util/ToolTipHover.vue'
   
   const userMgr = useUserMgr()

   const props = defineProps({ user: Object, size: Number, toolTip: String })

   const avatar  = computed(() => userMgr.getAvatar(props.user))   
</script>

<style>
</style>
