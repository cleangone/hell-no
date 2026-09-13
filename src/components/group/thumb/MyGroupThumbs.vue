<template>
   <div v-if="userStore.userExists && myGroups.length">
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
   import { useUserStore }  from '@/stores/userStore'
   import { useGroupStore } from '@/stores/groupStore'
   import GroupThumb        from './GroupThumb.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ })
   
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   
   const myGroups = computed(() => groupStore.myGroups )

   const thumbGroups = computed(() => {
      const groups = []
      if (myGroups.value) {
         for (const group of myGroups.value) {
            if (group.images?.length) {
               for (const image of group.images) {
                  if (image.active) { 
                     groups.push(group) 
                     break
                  }
               }
            } 
         }
      }
      return groups
   })

   const thumbGroupIds  = computed(() => thumbGroups.value ? thumbGroups.value.map(group => group.id) : [])
   const nonThumbGroups = computed(() => thumbGroupIds.value ? myGroups.value.filter(group => !thumbGroupIds.value.includes(group.id)) : [])
</script>

<style>
</style>
