import { defineStore } from 'pinia'
import { useChatStore } from '@/stores/chatStore'
import { useChatPostStore } from '@/stores/chatPostStore'
import { Defaults } from '@/utils/constants'
   
export const useChatMgr = defineStore('chatMgr', () => {
   const chatStore = useChatStore()
   const postStore = useChatPostStore()
   
   function getPostCount(chatId) { return getPosts(chatId).length }

   function getPostHiearchy(chatId) {
      const posts = getPosts(chatId)
      if (!posts.length) { return posts }

      const parentIdtoReplies = getPostReplyMap(posts) 

      const topLevelPosts = []
      for (const post of posts) {
         if (!post.replyToPostId ) { topLevelPosts.push({ ...post, level: 1 }) }
      }
      topLevelPosts.sort(function(a, b) { return b.dateModified - a.dateModified })      
      
      const allPosts = []
      for (const topLevelPost of topLevelPosts) {
         allPosts.push(topLevelPost)
         allPosts.push(...getChildPosts(topLevelPost, parentIdtoReplies))
      }
      return allPosts
   }

   function getPostReplyMap(posts) {
      const parentIdtoReplies = new Map()
      for (const post of posts) {
         if (post.replyToPostId) {
            const parentId = post.replyToPostId
            let replies = parentIdtoReplies.get(parentId)
            if (!replies) {
               replies = []
               parentIdtoReplies.set(parentId, replies)
            }
            replies.push({ ...post })
         }
      }
      return parentIdtoReplies
   }

   function getChildPosts(parentPost, parentIdtoReplies) {
      const allPosts = []
      const childPosts = parentIdtoReplies.get(parentPost.id)
      if (childPosts) {
         childPosts.sort(function(a, b) { return b.dateCreated - a.dateCreated })
         for (const childPost of childPosts) {
            childPost.level = parentPost.level + 1
            allPosts.push(childPost)
            allPosts.push(...getChildPosts(childPost, parentIdtoReplies))
         }
      }
      return allPosts
   }

   function deleteChat(chatId) {
      const posts = getPosts(chatId)
      if (posts.length) { 
         const postIds = posts.map(a => a.id)
         postStore.deletePosts(postIds)
       }

      chatStore.deleteChat(chatId)
   }

   // todo - delete parent post if it has been marked delete and its last dhild is being deleted
   function deletePost(post) {
      if (isRepliedTo(post)) { postStore.updatePost({ id: post.id, userId: Defaults.DELETED_USER_ID, text: "Deleted" }) }
      else { postStore.deletePost(post.id) }
   }

   function getPosts(chatId) {
      const posts = postStore.chatIdToPosts.get(chatId)
      return posts ? posts : []
   }

   function isRepliedTo(post) {
      for (const otherPost of getPosts(post.chatId)) {
         if (otherPost.replyToPostId == post.id) { return true }
      }
      return false
   }

   return { getPostCount, getPostHiearchy, deleteChat, deletePost }
})
