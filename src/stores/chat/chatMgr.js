import { defineStore } from 'pinia'
import { useChatStore } from './chatStore'
import { usePostStore } from './postStore'
import { Defaults } from '@/utils/constants'
   
export const useChatMgr = defineStore('chatMgr', () => {
   const chatStore = useChatStore()
   const postStore = usePostStore()
   
   function getPostCount(chatId) { return postStore.getPosts(chatId).length }

   function getPostHiearchy(chatId, collapsedPostIds = new Set()) {
      // console.log("getPostHiearchy", collapsedPostIds.size)
      const posts = postStore.getPosts(chatId)
      if (!posts.length) return { posts:[] }

      let topLevelPosts = []
      for (const post of posts) {
         if (!post.replyToPostId ) { topLevelPosts.push({ ...post, level: 1 }) }
      }
      topLevelPosts = toDateAscending(topLevelPosts)
      
      const postHiearchy = { posts: [], postIdtoReplies: getPostReplyMap(posts)}
      for (const topLevelPost of topLevelPosts) {
         postHiearchy.posts.push(topLevelPost)
         postHiearchy.posts.push(...getReplies(topLevelPost, postHiearchy.postIdtoReplies, collapsedPostIds))
      }
      return postHiearchy
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

   function getReplies(post, postIdtoReplies, collapsedPostIds) {
      // console.log("getReplies", parentPost.level + " - " + parentPost.text)
      const allPosts = []
      if (!collapsedPostIds.has(post.id) && postIdtoReplies.has(post.id)) {
         const replies = toDateAscending(postIdtoReplies.get(post.id))
         for (const reply of replies) {
            const replyPost = { ...reply, level: post.level + 1 }
            allPosts.push(replyPost)
            allPosts.push(...getReplies(replyPost, postIdtoReplies, collapsedPostIds))
         }
      }
      return allPosts
   }

   function toDateAscending(posts) { return posts.toSorted(function(a, b) { return a.dateCreated - b.dateCreated }) }

   function deleteChat(chatId) {
      const posts = postStore.getPosts(chatId)
      if (posts.length) { 
         const postIds = posts.map(a => a.id)
         postStore.deletePosts(postIds)
       }

      chatStore.deleteChat(chatId)
   }

   // todo - delete parent post if it has been marked delete and its last child is being deleted
   function deletePost(post) {
      if (isRepliedTo(post)) { postStore.updatePost({ id: post.id, userId: Defaults.DELETED_USER_ID, text: "Deleted" }) }
      else { postStore.deletePost(post.id) }
   }

   function isRepliedTo(post) {
      for (const otherPost of postStore.getPosts(post.chatId)) {
         if (otherPost.replyToPostId == post.id) { return true }
      }
      return false
   }

   return { getPostCount, getPostHiearchy, deleteChat, deletePost }
})
