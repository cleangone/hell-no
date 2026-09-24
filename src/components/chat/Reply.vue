<template>
   <v-card class="mb-2">
      <v-card-item class="pr-0 pt-0">
         <RouterLink :to="Route.USER.url + reply.userId" class="mr-2">{{ username }}</RouterLink>
         <span class="text-overline"> 
            {{ replyDate }}
         </span>
         <span v-if="canUpdate" style="float:right"> 
            <EditButton   @click="editReply()" xs/>
            <DeleteButton @click="deleteReply()" xs/>
         </span>
         <div class="pr-2 mt-n2">{{ reply.text }}</div>
      </v-card-item>
   </v-card>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditReply :reply="reply" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteReply :reply="reply" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useViewStore }  from '@/stores/viewStore'
   import EditReply     from './crud/EditReply.vue'
   import DeleteReply   from './crud/DeleteReply.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ reply: Object })

   const userStore = useUserStore()
   const viewStore = useViewStore()
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const username  = computed(() => userStore.getUsername(props.reply.userId))
   const replyDate = computed(() => props.reply.dateModified ? chatDate(props.reply.dateModified.toDate()) : "" )
   const canUpdate = computed(() => props.reply.userId == userStore.userId )
   const bgClass    = computed(() =>  "bg-" + viewStore.getMsgColor(props.reply.userId))
   
   const editReply   = () => { showEditDialog.value = true }
   const deleteReply = () => { showDeleteDialog.value = true }
</script>

<style>
</style>
