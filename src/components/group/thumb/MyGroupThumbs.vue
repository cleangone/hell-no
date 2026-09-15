<template>
   <div v-if="userStore.userExists && groupMgr.myGroupsExist">
      <span class="font-weight-bold">Groups</span> 
      <span v-for="group in nonThumbGroups" :key="group.id">
         | <RouterLink :to="Route.GROUP.url + group.id">{{ group.name }} </RouterLink> 
      </span>
      <v-container>
         <v-row v-if="thumbGroups.length" justify="space-around" class="mt-1">
            <GroupThumb v-for="group in thumbGroups" :key="group.id" :group="group"/>
         </v-row>
      </v-container>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useGroupMgr }  from '@/stores/groupMgr'
   import GroupThumb       from './GroupThumb.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ })
   
   const userStore = useUserStore()
   const groupMgr  = useGroupMgr()
   
   const thumbGroups    = computed(() => groupMgr.myThumbGroups)
   const nonThumbGroups = computed(() => groupMgr.myNonThumbGroups)
</script>

<style>
</style>
