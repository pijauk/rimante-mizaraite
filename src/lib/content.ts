import { getCollection, getEntry } from 'astro:content'

// JSON singletons are imported directly — Vite parses them at build time.
import site from '../content/settings/site.json'
import home from '../content/pages/home.json'
import booking from '../content/pages/booking.json'
import contact from '../content/pages/contact.json'

export const settings = site
export const homeContent = home
export const bookingContent = booking
export const contactContent = contact

export async function getServices() {
  const all = await getCollection('services')
  return all.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
}

export async function getFaq() {
  const all = await getCollection('faq')
  return all.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
}

export async function getPage(id: string) {
  return await getEntry('pages', id)
}
