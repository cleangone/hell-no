<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

   <div v-if="userExists">
      {{ user.firstName }}
      <v-btn @click="logout()">Logout</v-btn>
   
   </div>
   <RouterLink v-else to="/login">Login</RouterLink>
    
           
  <RouterView />


</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { RouterLink, RouterView } from 'vue-router'
   import HelloWorld from './components/HelloWorld.vue'

   import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
   import { useUserStore }    from '@/stores/userStore'
   
   const userStore    = useUserStore()
   
   onMounted(async() => {
      // logStore.info("App.onMounted")
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {      
         if (user) { userStore.userId = user.uid } 
         else { userStore.userId = "" }
         // viewStore.resetVisiblity()
      })

      // setWindowSize()
      // window.addEventListener('resize', setWindowSize)
   })

   const user = computed(() => { 
      const currUser = userStore.userExists ? userStore.user : null 
      // logStore.info("user update: " + (currUser ? currUser.firstName : "null"))
      // // const soloMode = currUser?.settings?.soloMode ? true : false
      // // if (localStore.soloMode != soloMode) { localStore.setSoloMode(soloMode) }
      return currUser
   })


   const userExists  = computed(() => userStore.userExists )
   
   const logout = () => { 
      signOut(getAuth()) 
      // router.push(URL.HOME)
   }


</script>


<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
