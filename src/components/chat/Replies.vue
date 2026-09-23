<template>
   <v-card v-for="reply in replies" :key="reply.id" class="ml-10 mb-2">
      <v-card-item class="pr-0 pt-0">
         <RouterLink :to="Route.USER.url + reply.userId" class="mr-2">{{ getUsername(reply.userId) }}</RouterLink>
         <span class="text-overline"> 
            {{ getDate(reply) }}
         </span>
         <span v-if="canUpdate(reply.userId)" style="float:right"> 
            <EditButton   @click="editReply(reply)"/>
            <DeleteButton @click="deleteReply(reply)"/>
         </span>
         <div class="pr-2 mt-n2">{{ reply.text }}</div>
      </v-card-item>
   </v-card>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditReply :reply="selectedReply" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteReply :post="selectedReply" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { useViewStore }  from '@/stores/viewStore'
   import EditReply     from './crud/EditReply.vue'
   import DeleteReply   from './crud/DeleteReply.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { Defaults, Route } from '@/utils/constants'
   
   const props = defineProps({ postId: String })

   const userStore = useUserStore()
   const replyStore = useReplyStore()
   const viewStore = useViewStore()
   const selectedReply    = ref({})
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const replies = computed(() => replyStore.getReplies(props.postId))

   const getUsername = (userId) => { return userStore.getUsername(userId) }
   const getBgColor  = (userId) => { return "bg-" + viewStore.getMsgColor(userId) }
   const getClass    = (post)   => { return getBgColor(post.userId) }
   const getDate     = (post)   => { return post.dateModified ? chatDate(post.dateModified.toDate()) : "" }
   const canUpdate   = (userId) => { return userId == userStore.userId }
   
   const editReply   = (reply)   => { showDialog(showEditDialog,   reply) }
   const deleteReply = (reply)   => { showDialog(showDeleteDialog, reply) }
   const showDialog = (showDialog, reply ) => {
      selectedReply.value = reply
      showDialog.value = true
   }
</script>

<style>
</style>
