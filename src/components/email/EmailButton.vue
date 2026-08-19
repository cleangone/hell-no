<template>
   <IconButton icon="mdi-email" @click="sendEmail()"/>
</template>

<script setup>
   import { useRouter } from 'vue-router'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ user:Object, item:Object })
   
   const router    = useRouter()
   const viewStore = useViewStore()
   
   const sendEmail = () => {
      viewStore.setEmailContext(props.user, props.item )
      router.push(Route.MESSAGE.url)
   }
</script>