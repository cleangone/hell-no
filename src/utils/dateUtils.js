
const DAY_IN_MILLIS = 1000 * 60 * 60 * 24
const SIX_DAYS_IN_MILLIS = DAY_IN_MILLIS * 6
const WEEK_IN_MILLIS     = DAY_IN_MILLIS * 7
const HH_MM = { hour: "numeric", minute: "numeric", hour12: "true" } // 3:15 PM
const MM_DD = { month:'numeric', day:'numeric' }       // 12/17
const DDD_HH_MM      = { weekday:'short', ...HH_MM  }  // Wed 3:15 PM
const MMM_DD         = { month:"short", day:"numeric"} // Dec 17
const CHAT_OPTIONS   = { ...MMM_DD, ...HH_MM }         // Dec 17, 3:15 PM
const DDD_MM_DD      = { weekday:'short', ...MM_DD }   // Wed 12/17
const DDD_MMM_DD_HH_MM  = { ...MMM_DD, ...DDD_HH_MM }  // Wed Dec 17, 3:15 PM
const MM_DD_HH_MM    = { ...MM_DD, ...HH_MM }          // 12/17, 3:15 PM
const MM_DD_YY       = { ...MM_DD, year:'2-digit' }    // 12/17/24
const MM_DD_YY_HH_MM = { ...MM_DD_YY, ...HH_MM }       // 12/17/24, 3:15 PM

export function defaultDisplayDate(dbDate) { return dbDate ? dbDate.toDate().toLocaleDateString() : "" }
export function displayDate(dbDate) {
      if (!dbDate) { return "" }
   
   const date = dbDate.toDate()
   const now = new Date()
   let options = MM_DD_YY
   if (date.valueOf() + SIX_DAYS_IN_MILLIS > now.valueOf()) { options = DDD_MM_DD }
   else if (now.getYear() == date.getYear()) { options = MM_DD }
   return date.toLocaleDateString(undefined, options)
}

export function chatDate(date) { 
   const options = { ...CHAT_OPTIONS }
   const now = new Date()
   if (date.getTime() + WEEK_IN_MILLIS > now.getTime()) { options.weekday = "short" }
   else if (date.getYear() != now.getYear()) { options.year = "numeric" }
   return date.toLocaleDateString('en-us', options) 
}

export function emailThreadDate(date) { return formatDate(date, HH_MM, DDD_HH_MM, MM_DD, MM_DD_YY) }
export function emailDate(date) { 
   return formatDate(date, DDD_MMM_DD_HH_MM, DDD_MMM_DD_HH_MM, MM_DD_HH_MM, MM_DD_YY_HH_MM) }
   
function sameYear(date1, date2)  { return date1.getYear() == date2.getYear() }
function daysSince(date1, date2) { return (dateUTC(date1) - dateUTC(date2)) / DAY_IN_MILLIS }
function dateUTC(date)   { return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) }

function formatDate(date, todayOptions, recentDayOptions, thisYearOptions, lastYearOptions) { 
   if (!date) { return "" }
   const now = new Date()
   const days = daysSince(now, date)
   let options = days ? recentDayOptions : todayOptions
   if (days > 2) { options = sameYear(date, now) ? thisYearOptions : lastYearOptions }
   
   return date.toLocaleString('en-us', options) 
}

export function defaultDateString(dbDate) { return dbDate ? dbDate.toDate().toLocaleDateString() : "" }
export function dateTimeString(dbDate)    { return dbDate ? dbDate.toDate().toLocaleDateString('en-us', MM_DD_YY_HH_MM) : "" }

export function timestampsEqual(timestamp1, timestamp2) { return timestamp1 && timestamp2 ? timestamp1.toMillis() == timestamp2.toMillis() : false }

