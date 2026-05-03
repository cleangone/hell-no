import { createRouter, createWebHistory } from 'vue-router'
import HomeView      from '../views/HomeView.vue'
import GalleryView   from '../views/GalleryView.vue'
import GalleriesView from '../views/GalleriesView.vue'
import ArtistView    from '../views/ArtistView.vue'
import SearchView    from '../views/SearchView.vue'
import FeedView      from '../views/FeedView.vue'
import RecentView    from '../views/RecentView.vue'
import ItemView      from '../views/ItemView.vue'
import UserView      from '../views/UserView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import RandomView    from '../views/RandomView.vue'
import LoginView     from '../views/LoginView.vue'
import RegisterView  from '../views/RegisterView.vue'
import MessageView   from '../views/MessageView.vue'
import AboutView     from '../views/AboutView.vue'
import AccountView   from '../views/AccountView.vue'
import AdminView     from '../views/AdminView.vue'
import AddItemView   from '../views/AddItemView.vue'
import EditItemView  from '../views/EditItemView.vue'
import { Route } from '@/utils/constants'

// lazy load not working - chunk retrieval error
// Account works, but others do not
// const MessageView   = () => import('../views/MessageView.vue')
// const AboutView     = () => import('../views/AboutView.vue')
// const AccountView   = () => import('../views/AccountView.vue')
// const AdminView     = () => import('../views/AdminView.vue')

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      createRoute(Route.HOME,      HomeView),
      createRoute(Route.GALLERY,   GalleryView,   ':id'),
      createRoute(Route.GALLERIES, GalleriesView, ':id'),
      createRoute(Route.ARTIST,    ArtistView,    ':id'),
      createRoute(Route.SEARCH,    SearchView),
      createRoute(Route.FEED,      FeedView),
      createRoute(Route.RECENT,    RecentView,    ':id'),
      createRoute(Route.ITEM,      ItemView,      ':origin/:nav/:id'),
      createRoute(Route.ITEM_CHILD,ItemView,      ':origin/:nav/:id/:child'),
      createRoute(Route.USER,      UserView,      ':id'),
      createRoute(Route.FAVORITES, FavoritesView),
      createRoute(Route.RANDOM,    RandomView),
      createRoute(Route.LOGIN,     LoginView),
      createRoute(Route.REGISTER,  RegisterView,  ':registerId'),
      createRoute(Route.MESSAGE,   MessageView),
      createRoute(Route.ABOUT,     AboutView),
      createRoute(Route.ACCOUNT,   AccountView),
      createRoute(Route.ADMIN,     AdminView),
      createRoute(Route.ADD_ITEM,  AddItemView),
      createRoute(Route.EDIT_ITEM, EditItemView,  ':id')
      
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import('../views/AboutView.vue')
  ]
})

function createRoute(route, component, urlParams = "") { 
   return { name: route.name, component: component, path: route.url + urlParams } 
}

export default router
