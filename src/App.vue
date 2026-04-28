
<template>
   <!-- <Head>
      <title>App title</title>
      <meta property="og:title" content="OG Title"/>
      <meta property="og:description" content="OG description of the page."/>
   </Head> -->
   <div class="app">     
      <v-row no-gutters class="flex-nowrap">
         <v-col :cols="sideCols" class="flex-grow-0 flex-shrink-0 nav-left" style="white-space:nowrap">
            <!-- top left icon for mobile -->
            <nav v-if="viewMgr.isMobile">
               <v-menu v-if="currentRouteName==Route.HOME && user"> <!-- force user evaluation to verify solo -->
                  <template v-slot:activator="{ props }">
                     <v-btn v-bind="props" icon="mdi-menu" class="icon-btn" size="medium" variant="text"></v-btn>
                  </template>
                  <v-list>
                     <v-list-item @click="router.push(URL.ADD_ITEM)">
                        <template v-slot:prepend>
                           <v-icon icon="mdi-plus" color="blue-darken-3"></v-icon>
                        </template>
                        <v-list-item-title>Add Item</v-list-item-title>
                     </v-list-item>
                     <v-list-item @click="router.push(URL.MESSAGE)">
                        <template v-slot:prepend>
                           <v-icon icon="mdi-message" color="blue-darken-3"></v-icon>
                        </template>
                        <v-list-item-title>Messages</v-list-item-title>
                     </v-list-item>
                     <v-list-item @click="router.push(URL.ACCOUNT)">
                        <template v-slot:prepend>
                           <v-icon icon="mdi-cog" color="blue-darken-3"></v-icon>
                        </template>
                        <v-list-item-title>Settings</v-list-item-title>
                     </v-list-item>
                  </v-list>
               </v-menu>
               <Icon v-if="currentRouteName!=Route.HOME" icon="mdi-chevron-left" @click="router.back()"/>
            </nav>
            <!-- top left links for desktop -->
            <nav v-else>
               <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.HOME" :url="URL.HOME" text="Home" />
               <span v-if="!inRoutes(Route.ACCOUNT, Route.ADMIN, Route.REGISTER)">
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.GALLERIES" :targetId="Defaults.SITE_ID" :url="URL.GALLERIES + Defaults.SITE_ID" text="Galleries" />
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.SEARCH" :url="URL.SEARCH" text="Search"/>
                  <span v-if="userExists && !viewMgr.solo">
                     | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.MESSAGE" :url="URL.MESSAGE" text="Messages" />
                  </span> 
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.ABOUT" :url="URL.ABOUT" text="About"/>
               </span> 
            </nav>
         </v-col>
         <!-- top center title for mobile -->
         <v-col cols="2" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isMobile" class="text-h6"> 
               <span v-if="isRoute(Route.HOME)">Hell-No Gallery</span>
               <span v-else-if="isRoute(Route.GALLERIES)">Galleries</span>
               <span v-else-if="isRoute(Route.GALLERY)">{{ pageName }} Gallery</span>
               <span v-else-if="inRoutes(Route.ITEM, Route.ITEM_CHILD)">{{ pageName }}</span>
               <span v-else-if="isRoute(Route.SEARCH)">Search</span>
               <span v-else-if="isRoute(Route.FAVORITES)">My Favorites</span>
               <span v-else-if="isRoute(Route.RECENT)">Updates</span>
               <span v-else-if="isRoute(Route.ABOUT)">About</span>
               <span v-else-if="isRoute(Route.USER)">{{ userTitle }}</span>
               <span v-else-if="isRoute(Route.MESSAGE)">Messages</span>
               <span v-else-if="isRoute(Route.ACCOUNT)" class="text-subtitle-1">My Account</span>
               <span v-else-if="isRoute(Route.ADMIN)" class="text-subtitle-1">Admin</span>
               <span v-else-if="isRoute(Route.ADD_ITEM)">Add Item</span>
               <span v-else-if="isRoute(Route.EDIT_ITEM)">Edit Item</span>
            </div>
            <nav v-else>
               <!-- <span v-if="currentRoute == Route.MESSAGE" class="text-h6">Messages</span> -->
               <span v-if="isRoute(Route.ACCOUNT)" class="title-sm">My Account</span>
               <span v-if="isRoute(Route.ADMIN)"   class="text-subtitle-1">Admin</span>
            </nav>
         </v-col>
         <!-- top right icons -->
         <v-col :cols="sideCols" class="flex-grow-0 flex-shrink-0 nav-right">
            <!-- top right icon for mobile -->


            <div v-if="viewMgr.isMobile">
               <span v-if="isRoute(Route.HOME)">
                  <DarkButton class="mr-n2"/>
               </span>
               <span v-else-if="isRoute(Route.GALLERIES)">
                  <GalleryThumbsConfig/>
               </span>
               <span v-else-if="inRoutes(Route.GALLERY, Route.FAVORITES, Route.RECENT)">
                  <ItemThumbConfig/>
                  <!-- <MultiStateIcon icon="mdi-text-box-plus" :stateColors="viewStore.xsThumbFieldsColors" 
                     :stateIndex="viewStore.xsThumbFieldsIndex" @click="viewStore.incrementXsThumbFieldsIndex()"/> -->
               </span>
               <span v-else-if="inRoutes(Route.ITEM, Route.ITEM_CHILD)">
                  <ToggleIcon icon="mdi-gesture-swipe" :state="viewStore.isMobileSwipe" @click="viewStore.toggleMobileSwipe()"/>
               </span>
               <span v-else-if="isRoute(Route.USER)">
                  <Icon icon="mdi-cog" @click="router.push(URL.ACCOUNT)"/>
               </span>
               <!-- <span v-else-if="currentRoute == Route.ACCOUNT && userIsAdmin">
                  <Icon icon="mdi-cog" @click="router.push(URL.ADMIN)"/>
               </span> -->
               <span v-else-if="isRoute(Route.ADD_ITEM)">
                  <Icon icon="mdi-close" @click="router.back()"/>
               </span>
            </div>
            <!-- top right icon for desktop -->
            <div v-else-if="userExists">
               <RouterLink :to="isMyUserPage ? URL.ACCOUNT : URL.USER + userId">{{ firstName }}</RouterLink>
               <v-menu>
                  <template v-slot:activator="{ props }">
                     <v-btn v-bind="props" icon="mdi-account" size="medium" variant="text" class="icon-btn"/>
                  </template>
                  <v-list>
                     <v-list-item @click="toggleSoloMode()">
                        <v-list-item-title>{{ viewMgr.solo ? "Exit " : "" }}Solo Mode</v-list-item-title>
                     </v-list-item>
                     <v-list-item @click="router.push(URL.ACCOUNT)">
                        <v-list-item-title>My Account</v-list-item-title>
                     </v-list-item>
                     <v-list-item  v-if="userIsAdmin" @click="router.push(URL.ADMIN)">
                        <v-list-item-title>Admin</v-list-item-title>
                     </v-list-item>
                     <v-list-item @click="logout">
                        <v-list-item-title>Logout</v-list-item-title>
                     </v-list-item>
                  </v-list>
               </v-menu>
            </div>
            <div v-else>
               <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.LOGIN" :url="URL.LOGIN" text="Login"/>
            </div> 
         </v-col>
      </v-row>
  
      <RouterView/>
 
      <div v-if="isRoute(Route.HOME)" class="small">
         {{ version }}<span v-if="appEnv.length"> - {{ appEnv }}</span>
      </div>
      <div v-else-if="isRoute(Route.ABOUT)" class="small">
         <div>{{ version }} ({{ windowSize.width }} x {{ windowSize.height }})</div>
         <div>{{ userAgent }}</div>
         <div v-if="isStandalone">Standalone</div>
      </div>

      <MessageSetup disableDisplay/>

      <!-- Bottom nav for mobile -->
      <v-layout v-if="viewMgr.isMobile" style="height:60px">
         <v-bottom-navigation v-model="navIndex" color="primary" style="min-height:60px" grow>
            <v-btn @click="router.push(URL.HOME)">
               <Icon icon="mdi-home"/>
               <span class="nav-text"></span>
            </v-btn>
            <v-btn @click="router.push(URL.GALLERIES + Defaults.SITE_ID)">
               <Icon icon="mdi-image-multiple"/>
               <span class="nav-text">Galleries</span>
            </v-btn>
            <v-btn @click="router.push(URL.SEARCH)">
               <Icon icon="mdi-magnify"/>
               <span class="nav-text">&nbsp;</span>
            </v-btn>
            <v-btn @click="router.push(URL.RECENT + userStore.userId)">
               <Icon icon="mdi-history"/>
               <span class="nav-text">Updates</span>
            </v-btn>   
            <v-btn @click="router.push(userExists ? URL.USER + userId : URL.LOGIN)">
               <Icon icon="mdi-account"/>
               <span class="nav-text"></span>
            </v-btn>
         </v-bottom-navigation>
      </v-layout>
   </div>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { Head } from '@unhead/vue/components'
   import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
   import { useUserStore }    from '@/stores/userStore'
   import { useAdminStore }   from '@/stores/adminStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLocalStore }   from '@/stores/localStore'
   import GalleryThumbsConfig from '@/components/gallery/GalleryThumbsConfig.vue'
   import ItemThumbConfig     from '@/components/item/thumb/ItemThumbConfig.vue'
   import MessageSetup        from '@/components/notification/MessageSetup.vue'
   import LinkOrText          from '@/components/util/LinkOrText.vue'
   import Icon                from '@/components/util/Icon.vue'
   import DarkButton          from '@/components/util/DarkButton.vue'
   import ToggleIcon          from '@/components/util/ToggleIcon.vue'
   import { handleError } from '@/utils/utils'
   import { Defaults, Route, URL } from '@/utils/constants'
   import { versions }   from '@/version'

   const route = useRoute()
   const router = useRouter()
   const userStore    = useUserStore()
   const adminStore   = useAdminStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const localStore   = useLocalStore()
   const windowSize = ref({})

   onMounted(async() => {
      // logStore.info("App.onMounted")
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {      
         if (user) { userStore.userId = user.uid } 
         else { userStore.userId = "" }
         // console.log("onAuthStateChanged", userStore.userId)
         viewStore.resetView()
      })

      setWindowSize()
      window.addEventListener('resize', setWindowSize)
   })

   onErrorCaptured((err) => { return handleError(err, "App") })

   router.beforeEach((to, from) => {
      if (to.name == Route.ADMIN   && !adminStore.isAdmin)   { return {name: Route.HOME}  }
      if (to.name == Route.ACCOUNT && !userStore.userExists) { return {name: Route.LOGIN} }
   })

   const setWindowSize = () => { windowSize.value = { width: window.innerWidth, height: window.innerHeight }}
   const sideCols = computed(() => viewMgr.isMobile ? 1 : 5)
   const pageName = computed(() => viewStore.pageName)
   const currentRoute     = computed(() => router.currentRoute.value ? router.currentRoute.value : {})
   const currentRouteName = computed(() => router.currentRoute.value ? router.currentRoute.value.name : "")
   const isMyUserPage     = computed(() => currentRouteName.value == Route.USER && route.params.id == userStore.userId)

   const isRoute  = (route) => { return currentRouteName.value == route }
   const inRoutes = (...routes) => { return routes.includes(currentRouteName.value) }  
   
   const user = computed(() => { 
      const currUser = userStore.userExists ? userStore.user : null 
      // logStore.info("user update: " + (currUser ? currUser.firstName : "null"))
      const soloMode = currUser?.settings?.soloMode ? true : false
      if (localStore.soloMode != soloMode) { localStore.setSoloMode(soloMode) }
      return currUser
   })
   const userExists  = computed(() => userStore.userExists )
   const userId      = computed(() => userStore.userId )
   const userIsAdmin = computed(() => adminStore.isAdmin )
   const firstName   = computed(() => user.value ? user.value.firstName : "")
   
   const version = computed(() => { return versions[0][0] })
   const userAgent = computed(() => navigator.userAgent)
   const isStandalone = computed(() => window.matchMedia('(display-mode: standalone)').matches)
   const appEnv = computed(() => { 
      // logStore.jsonInfo("navigator", 
         // { maxTouchPoints: navigator.maxTouchPoints, platform: navigator.platform, userAgent: navigator.userAgent })
      
      const installed = isStandalone.value ? "Installed" : ""
      const iosDevice = navigator.userAgent.match(/iPhone|iPad|iPod/) // ipad no longer matches
      return installed + (installed.length && iosDevice ? " on " : "") + (iosDevice ? iosDevice : "")
   })

   // used by mobile to indicate which, if any, bottom nav option the current page is
   const navIndex = computed({ 
      get() { 
         if (currentRouteName.value == Route.HOME) { return 0 }
         else if (currentRouteName.value == Route.GALLERIES) { return 1 }
         else if (currentRouteName.value == Route.SEARCH)    { return 2 }
         else if (currentRouteName.value == Route.RECENT)    { return 3 }
         else if (currentRouteName.value == Route.ACCOUNT)   { return 4 }
         else return null
       },
      set(index) {} 
   })

   const userTitle = computed(() => {
      const pageUser = userStore.getUser(route.params.id)
      return pageUser ? pageUser.username : "User" 
   })
   
   const toggleSoloMode = () => {      
      const settings = { ...user.value.settings }
      settings.soloMode = settings.soloMode ? false : true 
      userStore.updateSettings(settings)
      router.push(URL.HOME)
   }

   const logout = () => { 
      signOut(getAuth()) 
      router.push(URL.HOME)
   }
</script>

<style >
.app { 
   height: inherit;
   width: 100%;
   text-align: center; 
}
.title    { font-size: 35px; }
.title-sm { font-size: 16px; }
.edit-dialog {
   min-width: 500px;  
}
.float-bottom {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 5;
} 
.hand {
   cursor: pointer;
}
.nav-left {
   display: flex;
   justify-content: left;
   align-items: center;
}
.nav-right { 
   display: flex;
   justify-content: right;
   align-items: center;
}
.nav-text {
   min-height:25px
}
.pointer {
   cursor: pointer;
}
.small {
   font-size: 10px;
   margin: 40px;
}
.tight-checkbox { 
   max-height: 30px;
}
.walldiv {
  width: 100%;
  position: relative;
}
.width-100 { 
   min-width: 100%; 
   max-width: 100%; 
}
</style>


