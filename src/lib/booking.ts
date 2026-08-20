import { settings } from './content'

/**
 * Cal.com element-click embed wiring, derived from the Keystatic bookingUrl so
 * the client can change the calendar without touching code.
 *
 * https://cal.com/pijqde-pq-6hyrsl/15min  ->  link "pijqde-pq-6hyrsl/15min",
 * namespace "15min".
 */
function parse() {
  const url = settings?.bookingUrl
  if (!url) return null
  let link: string
  try {
    link = new URL(url).pathname.replace(/^\/+|\/+$/g, '')
  } catch {
    return null // not a URL (e.g. someone typed a bare slug) — fall back to the page
  }
  if (!link.includes('/')) return null
  return { link, namespace: link.split('/').pop()! }
}

const parsed = parse()

export const calLink = parsed?.link ?? null
export const calNamespace = parsed?.namespace ?? null

/** Theme is pinned light: the site is light-only, so a visitor whose OS is dark
 *  would otherwise get a dark calendar inside a light page. */
export const calConfig = {
  layout: 'month_view',
  useSlotsViewOnSmallScreen: 'true',
  theme: 'light',
}

/**
 * Where a booking CTA points. With Cal's script loaded the click is swallowed
 * and the modal opens instead; this href is what happens when it isn't —
 * JavaScript off, embed.js blocked or failed. It goes straight to the Cal.com
 * booking page, so the CTA always leads somewhere that can take a booking.
 * Falls back to the contact page if no calendar is configured.
 */
export const bookingHref: string = settings?.bookingUrl || '/kontaktai'

/** Spread onto any element that should open the booking modal. */
export const calAttrs: Record<string, string> = parsed
  ? {
      'data-cal-link': parsed.link,
      'data-cal-namespace': parsed.namespace,
      'data-cal-config': JSON.stringify(calConfig),
    }
  : {}
