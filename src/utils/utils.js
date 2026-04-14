import { useNow, useDateFormat } from '@vueuse/core'
import { v4 as uuid } from 'uuid'
import { BackgroundColors, State } from './constants'
   
export const requiredRule = [ v => !!v || 'Required' ]
export const minRule      = [ v => v.length >= 6 || 'Min 6 characters' ]
export const emailRule    = [ v => !!v || 'Required',
   v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail not valid',
]
export const optionalYearRule = [ v => isOptionalYear(v) ]
const isOptionalYear = (v) => { 
   return !v || parseInt(v) && v > 1800 && v <= new Date().getFullYear() ? true : 'Invalid year' 
}

export function dateUuid() {
   const datePrefix = useDateFormat(useNow(), 'MM-DD-YY-')
   return datePrefix.value + uuid()
}
         
export function logError(viewName, err, instance) { 
   if (err.message == "img is null" && instance.$options.name == "BaseTransition") { return false }
   
   console.log(viewName + " error: " + err.message + ", instance: " + instance.$options.name)
   return false // do not bubble up error
}

export function randomPlate() { return random3('ABCDEFGHIJKLMNOPQRSTUVWXYZ') + random3('1234567890') }
function random3(chars) {
    var result = ''
    for (var i=0; i<3; i++) { result += chars[Math.floor(Math.random() * chars.length)] }
    return result
}

export function thumbBackgroundColorStyle(obj) { return isPrivate(obj) || isInvisible(obj) ? backgroundColorStyle(obj.state) : "" }
export function backgroundColorStyle(state) { return "background-color: " + backgroundColorCode(state) }
export function backgroundColorCode(state) {
   if (state == State.PUBLIC)         { return BackgroundColors.GREEN.code }
   else if (state == State.GROUP)     { return BackgroundColors.YELLOW.code }
   else if (state == State.PRIVATE)   { return BackgroundColors.RED.code }
   else if (state == State.INVISIBLE) { return BackgroundColors.GREY.code }
   
   return BackgroundColors.WHITE.code
}

export function removeArrayEntry(array, entry) { 
   const index = array.indexOf(entry)
   if (index > -1) { array.splice(index, 1) }
}

export const IdSet = class {
   constructor() { this.set = new Set }
   has(id) { return this.set.has(id) }
   addId(id) { this.set.add(id) }
   addIds(ids) { for (const id of ids) { this.set.add(id) } }
   asArray() { return [ ...this.set ] }
}

export function isPublic(obj)    { return obj && obj.state == State.PUBLIC  }
export function isGroup(obj)     { return obj && obj.state == State.GROUP   }
export function isPrivate(obj)   { return obj && obj.state == State.PRIVATE }
export function isHidden(obj)    { return obj && obj.state == State.HIDDEN  }
export function isInvisible(obj) { return obj && obj.state == State.INVISIBLE  }
export function isPublicOrGroup(obj) { return isPublic(obj) || isGroup(obj) }
export function isOwned(obj, userId) { return obj && userId && obj.userId == userId }   

export function objAspectRatio(object) { return object.width / object.height }
   
export function sortByName(objs) {
   const sortedObjs = [ ...objs ]
   sortedObjs.sort((a, b) => a.name.localeCompare(b.name))
   return sortedObjs
}

export function randomizeArray(array) {
   return !array || !array.length ? array : 
      array
         .map(value => ({ value, sort: Math.random() }))
         .sort((a, b) => a.sort - b.sort)
         .map(({ value }) => value)
}

export function populated(str) { return str && str.length }

const KNOWN_ERRORS = [ " is null", ".value is undefined" ]
export function handleError(err, component) { 
   for (const suffix of KNOWN_ERRORS) {
      if (err.message.endsWith(suffix)) { 
         console.log(component + " known error: " + err.name + " - " + err.message)
         return false // do not bubble up error
      }
   } 
   return true
}
