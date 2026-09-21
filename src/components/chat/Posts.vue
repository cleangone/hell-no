<template>
   <v-card v-for="post in posts" :key="post.id" @click="toggleIfReplies(post.id)" class="mb-2"
         :class="getClass(post)" :style="{marginLeft: (post.level * 20)+'px'}">
      <v-card-item class="pr-0 pt-0">
         <div v-if="!isDeleted(post)">
            <RouterLink :to="Route.USER.url + post.userId" class="mr-2">{{ getUsername(post.userId) }}</RouterLink>
            <span class="text-overline"> 
               {{ getDate(post) }}
               <IconButton @click="reply(post)" icon="mdi-reply" />
               <IconButton v-if="hasReplies(post.id)" :icon="isCollapsed(post)?'mdi-arrow-expand-vertical':'mdi-arrow-collapse-vertical'"/>
            </span>
            <span v-if="canUpdate(post.userId)" style="float:right"> 
               <EditButton   @click="editPost(post, comment)"/>
               <DeleteButton @click="deletePost(post, comment)"/>
            </span>
         </div>   
         <div class="pr-2 mt-n2">{{ post.text }}</div>
      </v-card-item>
   </v-card>

   <v-dialog v-model="showRelyDialog" width="auto">
      <AddPost :chatId="chatId" :userId="userStore.userId" :replyToPostId="selectedPost.id" @done="showRelyDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditPost :post="selectedPost" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeletePost :post="selectedPost" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useChatMgr }   from '@/stores/chat/chatMgr'
   import { useViewStore } from '@/stores/viewStore'
   import AddPost       from './crud/AddPost.vue'
   import EditPost      from './crud/EditPost.vue'
   import DeletePost    from './crud/DeletePost.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { Defaults, Route } from '@/utils/constants'
   
   const props = defineProps({ chatId: String })
   const userStore = useUserStore()
   const chatMgr   = useChatMgr()
   const viewStore = useViewStore()
   const selectedPost     = ref({})
   const collapsedPostIds = ref(new Set())
   const showRelyDialog   = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const postHiearchy = computed(() => chatMgr.getPostHiearchy(props.chatId, collapsedPostIds.value))
   const posts = computed(() => postHiearchy.value?.posts ?? [])

   const getUsername = (userId) => { return userStore.getUsername(userId) }
   const getBgColor  = (userId) => { return "bg-" + viewStore.getMsgColor(userId) }
   const getClass    = (post)   => { return getBgColor(post.userId) }
   const getDate     = (post)   => { return post.dateModified ? chatDate(post.dateModified.toDate()) : "" }
   const isDeleted   = (post)   => { return post.userId == Defaults.DELETED_USER_ID }
   const isCollapsed = (post)   => { return collapsedPostIds.value.has(post.id) }
   const hasReplies  = (postId) => { return postHiearchy.value?.postIdtoReplies?.has(postId) }
   const canUpdate   = (userId) => { return userId == userStore.userId }
   
   const toggleIfReplies = (postId) => { if (hasReplies(postId)) togglePost(postId) }
   const togglePost = (postId) => { 
      // console.log("togglePost")
      const ids = new Set(collapsedPostIds.value)
      ids.has(postId) ? ids.delete(postId) : ids.add(postId) 
      collapsedPostIds.value = ids // drives display update
   }
   
   const reply      = (post)   => { showDialog(showRelyDialog,   post) }
   const editPost   = (post)   => { showDialog(showEditDialog,   post) }
   const deletePost = (post)   => { showDialog(showDeleteDialog, post) }
   const showDialog = (showDialog, post ) => {
      selectedPost.value = post
      showDialog.value = true
   }
</script>

<style>
</style>
