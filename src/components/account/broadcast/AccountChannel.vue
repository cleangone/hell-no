<template>
   <div class="text-left text-h6">
      <a @click="$emit(Emit.DONE)">Channels</a> > {{ channel.name }}
   </div>
   <div class="ma-5">
      <BroadcastItem v-if="broadcastItem" :broadcastItem="broadcastItem"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useChannelStore } from '@/stores/channelStore'
   import BroadcastItem from './BroadcastItem.vue'
   
   import { Emit } from '@/utils/constants'
   
   const props = defineProps([ 'channelId' ])
   const emit  = defineEmits([ Emit.DONE ])
   const channelStore = useChannelStore()
   
   const channel       = computed(() => channelStore.channelIdToMyChannel.get(props.channelId))
   const broadcastItem = computed(() => channel.value ? channel.value.broadcastItem : null)
</script>

<style>
</style>
