// Shows the last-successfully-loaded data INSTANTLY on every reopen,
// instead of a loading screen every single time — while a fresh fetch
// still runs quietly in the background and updates the screen once it
// lands. Only a person's very first-ever visit to a given page sees a
// real loading state; every visit after that feels instant, even though
// the backend itself is no faster than before.
//
// 24 hours, not 5 minutes — a short TTL defeats the whole point for how
// people actually use this: a parent checking once or twice a DAY would
// have their cache expire between visits, making it useless. Since a
// fresh fetch always runs in the background regardless of cache age and
// silently replaces whatever's shown, staleness self-corrects within a
// second or two of opening the page either way — there's no real
// correctness downside to keeping cached data around much longer.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function loadCached(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, savedAt } = JSON.parse(raw)
    if (Date.now() - savedAt > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

export function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }))
  } catch {
    // localStorage can fail (private browsing, storage full) — fine to
    // just skip caching in that case, nothing else depends on it working.
  }
}
