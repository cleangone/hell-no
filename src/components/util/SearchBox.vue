<template>
   <div class="search-wrapper">
      <v-icon icon="mdi-magnify" size="small" class="search-icon"/>
      <input v-model="query" type="text" class="small-grey-box ml-n6" @keyup.enter="search()"/>
   </div>         
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { useSearchMgr } from '@/stores/searchMgr'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ icon: String, state: Boolean })
   const router = useRouter()
   const searchMgr = useSearchMgr()
   const query = ref(null)
   
   const search = () => { 
      if (query.value?.length) {
         searchMgr.search(query.value)
         query.value = null
         router.push(Route.SEARCH.url)
      }
   }
</script>

<style>
.search-wrapper {
  display: inline-block;
}
.search-icon {
  color: #888;
}
.small-grey-box {
  background-color: #f5f5f5;
  width: 10em;  
  font-size: 14px;
  padding: 2px 2px 2px 24px; /* Extra left padding for icon */
  border: 1px solid #ccc;
  border-radius: 4px;
}

</style>