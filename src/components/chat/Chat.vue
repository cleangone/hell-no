<template>
   <v-card-item class="bg-blue-lighten-5 pr-0">
      <div>
         <span class="text-subtitle-1 mr-2"> {{ chat.name }}</span>
         <span class="text-overline mb-1">
            {{ dateModified }}
            <span v-if="isArchived"> (Archived)</span>   
         </span>   
         <TextButton @click="showAddPostDialog=true" text="Add Post"/>
      </div>
      <div class="mt-n2"> {{ chat.description }}</div>
      <div v-if="postCount"> {{ postCount }} {{ postCount == 1 ? 'Post' : 'Posts' }}</div>
   </v-card-item>
  
   <v-dialog v-model="showAddPostDialog" width="auto">
      <AddPost :chatId="chat.id" :userId="userStore.userId" @done="showAddPostDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import AddPost    from './post/AddPost.vue'
   import TextButton from '@/components/util/TextButton.vue'
   
   import { chatDate } from '@/utils/dateUtils'
   import { ChatState } from '@/utils/constants'
   
   const props = defineProps({ chat: Object, postCount: Number })
   const userStore = useUserStore()
   const showAddPostDialog = ref(false)
   
   const isArchived   = computed(() => props.chat.state ==  ChatState.ARCHIVED )
   const dateModified = computed(() => chatDate(props.chat.dateModified.toDate()))
</script>

<style>
</style>
