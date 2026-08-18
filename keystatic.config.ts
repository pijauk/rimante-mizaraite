import { config, fields, collection, singleton } from '@keystatic/core'

/**
 * Storage mode.
 *
 * Local mode writes to files on your machine — use it while developing.
 * Cloud mode lets the client edit the live site without a GitHub account.
 *
 * Set PUBLIC_KEYSTATIC_STORAGE=cloud in .env once the Keystatic Cloud team +
 * project exist, and fill in CLOUD_PROJECT below.
 *
 * The PUBLIC_ prefix is required: this config is bundled into the browser
 * admin UI, and Astro only exposes PUBLIC_-prefixed vars to client code.
 * Without it the value is undefined in the browser and Keystatic silently
 * stays in local mode.
 *
 * IMPORTANT (agency use): Keystatic Cloud grants access at TEAM level and
 * every user in a team can see every project in that team. Create one team
 * per client. Free plan = 3 users per team, unlimited teams and projects.
 */
// Format is 'team/project'. Keystatic Cloud shows a ready-to-paste snippet on
// the project's settings page — confirm the slug there, since the team slug is
// derived from the team name and may differ from what you typed.
const CLOUD_PROJECT = 'rimante-mi/rimante-mizaraite'

const useCloud = import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'cloud'

/** Shared SEO fields, reused on every page. */
function seoFields() {
  return fields.object(
    {
      title: fields.text({
        label: 'SEO antraštė',
        description: 'Rodoma Google paieškoje. Iki ~60 simbolių.',
      }),
      description: fields.text({
        label: 'SEO aprasymas',
        multiline: true,
        description: 'Rodomas Google paieškoje. Iki ~155 simbolių.',
      }),
    },
    { label: 'SEO' }
  )
}

export default config({
  storage: useCloud ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: CLOUD_PROJECT },

  ui: {
    brand: { name: 'Svetainės turinys' },
    navigation: {
      Puslapiai: ['home', 'about', 'approach', 'booking', 'contact'],
      Turinys: ['services', 'faq'],
      Nustatymai: ['siteSettings', 'privacy'],
    },
  },

  singletons: {
    siteSettings: singleton({
      label: 'Bendri nustatymai',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        practitionerName: fields.text({
          label: 'Vardas ir pavardė',
          description: 'Rodoma antraštėje ir struktūriniuose duomenyse.',
        }),
        professionalTitle: fields.text({
          label: 'Profesinis vardas',
          description:
            'TEISINĖ PASTABA: naudokite tik tą pavadinimą, kurį turite teisę vartoti pagal savo licenciją.',
        }),
        tagline: fields.text({ label: 'Trumpas apibūdinimas', multiline: true }),
        email: fields.text({ label: 'El. paštas' }),
        phone: fields.text({ label: 'Telefonas' }),
        bookingUrl: fields.url({
          label: 'Registracijos nuoroda (Cal.com)',
          description: 'Nemokamo 15 min. pokalbio kalendoriaus nuoroda.',
        }),
        address: fields.object(
          {
            street: fields.text({ label: 'Gatvė' }),
            city: fields.text({ label: 'Miestas', defaultValue: 'Vilnius' }),
            postalCode: fields.text({ label: 'Pašto kodas' }),
          },
          { label: 'Adresas' }
        ),
        openingHours: fields.array(
          fields.object({
            days: fields.text({ label: 'Dienos', description: 'pvz. I–V' }),
            hours: fields.text({ label: 'Valandos', description: 'pvz. 9:00–18:00' }),
          }),
          {
            label: 'Darbo laikas',
            itemLabel: (p) => (p.fields.days.value || '') + ' ' + (p.fields.hours.value || ''),
          }
        ),
        priceRange: fields.select({
          label: 'Kainų lygis (Google)',
          options: [
            { label: 'EUR', value: '€' },
            { label: 'EUR EUR', value: '€€' },
            { label: 'EUR EUR EUR', value: '€€€' },
          ],
          defaultValue: '€€',
        }),
      },
    }),

    home: singleton({
      label: 'Pradžios puslapis',
      path: 'src/content/pages/home',
      format: { data: 'json' },
      schema: {
        seo: seoFields(),
        heroHeading: fields.text({ label: 'Pagrindinė antraštė', multiline: true }),
        heroIntro: fields.text({ label: 'Įžanga', multiline: true }),
        heroImage: fields.image({
          label: 'Nuotrauka',
          directory: 'public/images/home',
          publicPath: '/images/home/',
          description:
            'TIK terapeuto portretas arba tuščias kabinetas. NEGALIMA vaizduoti kliento ar konsultacijos.',
        }),
        heroImageAlt: fields.text({ label: 'Nuotraukos alt tekstas' }),
        helpWithHeading: fields.text({ label: 'Skyriaus antraštė', defaultValue: 'Su kuo dirbu' }),
        helpWith: fields.array(
          fields.object({
            title: fields.text({ label: 'Sritis' }),
            description: fields.text({ label: 'Aprašymas', multiline: true }),
          }),
          { label: 'Sritys', itemLabel: (p) => p.fields.title.value }
        ),
        midImage: fields.image({
          label: 'Plati nuotrauka (per visą plotį)',
          directory: 'public/images/home',
          publicPath: '/images/home/',
          description:
            'TEISINĖ PASTABA: tik tuščias kabinetas, pastato įėjimas ar detalė be žmonių. NEGALIMA vaizduoti kliento ar konsultacijos.',
        }),
        midImageAlt: fields.text({ label: 'Nuotraukos alt tekstas' }),
        closingHeading: fields.text({ label: 'Baigiamoji antraštė' }),
        closingText: fields.text({ label: 'Baigiamasis tekstas', multiline: true }),
      },
    }),

    about: singleton({
      label: 'Apie mane',
      path: 'src/content/pages/about',
      format: { contentField: 'content' },
      schema: {
        seo: seoFields(),
        heading: fields.text({ label: 'Antraštė', defaultValue: 'Apie mane' }),
        portrait: fields.image({
          label: 'Portretas',
          directory: 'public/images/about',
          publicPath: '/images/about/',
        }),
        portraitAlt: fields.text({ label: 'Alt tekstas' }),
        roomImage: fields.image({
          label: 'Kabineto nuotrauka (per visą plotį)',
          directory: 'public/images/about',
          publicPath: '/images/about/',
          description:
            'TEISINĖ PASTABA: tik tuščias kabinetas, pastato įėjimas ar detalė be žmonių. NEGALIMA vaizduoti kliento ar konsultacijos.',
        }),
        roomImageAlt: fields.text({ label: 'Nuotraukos alt tekstas' }),
        content: fields.markdoc({ label: 'Tekstas' }),
        qualifications: fields.array(
          fields.object({
            title: fields.text({ label: 'Kvalifikacija' }),
            institution: fields.text({ label: 'Įstaiga' }),
            year: fields.text({ label: 'Metai' }),
          }),
          { label: 'Kvalifikacijos', itemLabel: (p) => p.fields.title.value }
        ),
      },
    }),

    approach: singleton({
      label: 'Kaip vyksta konsultacijos',
      path: 'src/content/pages/approach',
      format: { contentField: 'content' },
      schema: {
        seo: seoFields(),
        heading: fields.text({ label: 'Antraštė', defaultValue: 'Kaip vyksta konsultacijos' }),
        intro: fields.text({ label: 'Įžanga', multiline: true }),
        roomImage: fields.image({
          label: 'Kabineto nuotrauka (per visą plotį)',
          directory: 'public/images/approach',
          publicPath: '/images/approach/',
          description:
            'TEISINĖ PASTABA: tik tuščias kabinetas, pastato įėjimas ar detalė be žmonių. NEGALIMA vaizduoti kliento ar konsultacijos.',
        }),
        roomImageAlt: fields.text({ label: 'Nuotraukos alt tekstas' }),
        content: fields.markdoc({ label: 'Tekstas' }),
        firstSessionHeading: fields.text({
          label: 'Pirmo susitikimo antraštė',
          defaultValue: 'Pirmasis susitikimas',
        }),
        firstSessionText: fields.text({ label: 'Pirmo susitikimo aprašymas', multiline: true }),
      },
    }),

    booking: singleton({
      label: 'Registracija',
      path: 'src/content/pages/booking',
      format: { data: 'json' },
      schema: {
        seo: seoFields(),
        heading: fields.text({
          label: 'Antraštė',
          defaultValue: 'Nemokamas susipažinimo pokalbis',
        }),
        intro: fields.text({ label: 'Paaiškinimas', multiline: true }),
        whatToExpect: fields.array(fields.text({ label: 'Punktas' }), {
          label: 'Ko tikėtis',
          itemLabel: (p) => p.value,
        }),
        cancellationPolicy: fields.text({ label: 'Atšaukimo sąlygos', multiline: true }),
      },
    }),

    contact: singleton({
      label: 'Kontaktai',
      path: 'src/content/pages/contact',
      format: { data: 'json' },
      schema: {
        seo: seoFields(),
        heading: fields.text({ label: 'Antraštė', defaultValue: 'Kontaktai' }),
        intro: fields.text({ label: 'Įžanga', multiline: true }),
        entranceImage: fields.image({
          label: 'Įėjimo / pastato nuotrauka (per visą plotį)',
          directory: 'public/images/contact',
          publicPath: '/images/contact/',
          description:
            'Padeda klientui rasti kabinetą. TIK pastatas, įėjimas ar tuščias kabinetas — be žmonių.',
        }),
        entranceImageAlt: fields.text({ label: 'Nuotraukos alt tekstas' }),
        formNotice: fields.text({
          label: 'Pastaba prie formos',
          multiline: true,
          description:
            'Švelniai atgraso nuo jautrios sveikatos informacijos rašymo laisvame lauke.',
        }),
        travelInfo: fields.text({ label: 'Kaip atvykti', multiline: true }),
      },
    }),

    privacy: singleton({
      label: 'Privatumo politika',
      path: 'src/content/pages/privacy',
      format: { contentField: 'content' },
      schema: {
        seo: seoFields(),
        heading: fields.text({ label: 'Antraštė', defaultValue: 'Privatumo politika' }),
        lastUpdated: fields.date({ label: 'Atnaujinta' }),
        content: fields.markdoc({ label: 'Tekstas' }),
      },
    }),
  },

  collections: {
    services: collection({
      label: 'Paslaugos',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { contentField: 'description' },
      columns: ['title', 'price'],
      schema: {
        title: fields.slug({ name: { label: 'Pavadinimas' } }),
        order: fields.integer({ label: 'Eiliškumas', defaultValue: 1 }),
        duration: fields.text({ label: 'Trukmė', description: 'pvz. 50 min.' }),
        price: fields.text({ label: 'Kaina', description: 'pvz. 70 €' }),
        format: fields.multiselect({
          label: 'Formatas',
          options: [
            { label: 'Gyvai', value: 'in-person' },
            { label: 'Internetu', value: 'online' },
          ],
          defaultValue: ['in-person', 'online'],
        }),
        forNewClients: fields.checkbox({
          label: 'Galima registruotis naujiems klientams',
          defaultValue: false,
        }),
        description: fields.markdoc({ label: 'Aprašymas' }),
      },
    }),

    faq: collection({
      label: 'D.U.K.',
      slugField: 'question',
      path: 'src/content/faq/*',
      format: { contentField: 'answer' },
      columns: ['question'],
      schema: {
        question: fields.slug({ name: { label: 'Klausimas' } }),
        order: fields.integer({ label: 'Eiliškumas', defaultValue: 1 }),
        answer: fields.markdoc({ label: 'Atsakymas' }),
      },
    }),
  },
})
