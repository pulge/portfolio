import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'mark',
  description:
    'A portfolio and personal website.',
  href: 'https://pulge.vercel.app',
  author: 'jktrn',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS = [
  {
    href: '/blog',
    label: 'blog',
    icon: 'lucide:newspaper',
  },
  {
    href: '/projects',
    label: 'projects',
    icon: 'lucide:folder',
  },
  {
    href: '/media',
    label: 'media',
    icon: 'lucide:camera',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/pulge',
    label: 'GitHub',
  },
  // {
  //   href: 'https://twitter.com/enscry',
  //   label: 'Twitter',
  // },
  {
    href: 'mailto:fulguerinasmarkjason0311@gmail.com',
    label: 'Email',
  },
  {
    href: 'https://www.instagram.com/_mark.rcn/',
    label: 'Instagram',
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
