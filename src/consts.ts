import type { IconMap, Site, SocialLink } from '@/types'

export const SITE: Site = {
  title: 'mark',
  description:
    'A portfolio and personal website.',
  href: 'https://pulge.pages.dev',
  author: 'mfulguerinas',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS = [
  {
    href: '/media',
    label: 'media',
    icon: 'lucide:camera',
  },
  {
    href: '/blog',
    label: 'articles',
    icon: 'lucide:newspaper',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/pulge',
    label: 'GitHub',
  },
  {
    href: '/inbox',
    label: 'Inbox',
    target: '_self',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
  Instagram: 'lucide:instagram',
}
