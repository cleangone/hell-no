<template>
   <div v-if="userStore.userExists && groupMgr.myThumbGroupsExist">
      <div>
         <span class="font-weight-bold">Groups</span> |
         <RouterLink :to="Route.GROUPS.url">View all</RouterLink>
      </div>
      <v-container class="mt-2">
         <v-row v-if="thumbGroups.length" justify="space-around">
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
   
   const thumbGroups = computed(() => groupMgr.myThumbGroups)
</script>

<style>
</style>
