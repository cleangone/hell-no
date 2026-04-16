import { createRouter, createWebHistory } from 'vue-router'
import HomeView      from '../views/HomeView.vue'
import GalleryView   from '../views/GalleryView.vue'
import GalleriesView from '../views/GalleriesView.vue'
import SearchView    from '../views/SearchView.vue'
import FeedView      from '../views/FeedView.vue'
import RecentView    from '../views/RecentView.vue'
import ItemView      from '../views/ItemView.vue'
import UserView      from '../views/UserView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import LoginView     from '../views/LoginView.vue'
import RegisterView  from '../views/RegisterView.vue'
import MessageView   from '../views/MessageView.vue'
import AboutView     from '../views/AboutView.vue'
import AccountView   from '../views/AccountView.vue'
import AdminView     from '../views/AdminView.vue'
import AddItemView   from '../views/AddItemView.vue'
import EditItemView  from '../views/EditItemView.vue'
import { Route, URL } from '@/utils/constants'

// lazy load not working - chunk retrieval error
// Account works, but others do not
// const MessageView   = () => import('../views/MessageView.vue')
// const AboutView     = () => import('../views/AboutView.vue')
// const AccountView   = () => import('../views/AccountView.vue')
// const AdminView     = () => import('../views/AdminView.vue')

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      createRoute(Route.HOME,      HomeView,      URL.HOME),
      createRoute(Route.GALLERY,   GalleryView,   URL.GALLERY + ':id'),
      createRoute(Route.GALLERIES, GalleriesView, URL.GALLERIES + ':id'),
      createRoute(Route.SEARCH,    SearchView,    URL.SEARCH),
      createRoute(Route.FEED,      FeedView,      URL.FEED),
      createRoute(Route.RECENT,    RecentView,    URL.RECENT + ':id'),
      createRoute(Route.ITEM,      ItemView,      URL.ITEM + ':origin/:nav/:id'),
      createRoute(Route.ITEM_CHILD,ItemView,      URL.ITEM + ':origin/:nav/:id/:child'),
      createRoute(Route.USER,      UserView,      URL.USER + ':id'),
      createRoute(Route.FAVORITES, FavoritesView, URL.FAVORITES),
      createRoute(Route.LOGIN,     LoginView,     URL.LOGIN),
      createRoute(Route.REGISTER,  RegisterView,  URL.REGISTER + ':registerId'),
      createRoute(Route.MESSAGE,   MessageView,   URL.MESSAGE),
      createRoute(Route.ABOUT,     AboutView,     URL.ABOUT),
      createRoute(Route.ACCOUNT,   AccountView,   URL.ACCOUNT),
      createRoute(Route.ADMIN,     AdminView,     URL.ADMIN),
      createRoute(Route.ADD_ITEM,  AddItemView,   URL.ADD_ITEM),
      createRoute(Route.EDIT_ITEM, EditItemView,  URL.EDIT_ITEM + ':id')
      
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import('../views/AboutView.vue')
  ]
})

function createRoute(name, component, path) { return { name: name, component: component, path: path } }

export default router
