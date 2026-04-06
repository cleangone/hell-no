<template>
   <div class="text-left">
      <MessageSetup/>
      <MessageHandler/>
      <SendMessage/>
   </div>
</template>

<script setup>
   import MessageSetup   from '@/components/notification/MessageSetup.vue'
   import MessageHandler from '@/components/notification/MessageHandler.vue'
   import SendMessage    from '@/components/notification/SendMessage.vue'
</script>

<style>
</style>
