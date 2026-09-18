<template>
    <v-menu>
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-move"/>
      </template>
      <v-list>
         <v-list-item v-for="group in groups" :key="group.id" @click="sendToGroup(group)">
            <v-list-item-title>{{ group.name }}</v-list-item-title>
         </v-list-item>
      </v-list>
   </v-menu>
</template>

<script setup>
   import { computed } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import IconButton from '@/components/util/IconButton.vue'
   
   const props = defineProps({ image: Object })

   const groupStore = useGroupStore()

   const groups = computed(() => groupStore.myGroups)
   const sendToGroup = (group) => { groupStore.addImage(group.id, props.image)}
</script>

<style>
</style>