import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts, getEntryDate, getEntryTitle, getEntryHref } from '@/lib/data-utils'

export async function GET(context: APIContext) {
  try {
    const posts = await getAllPosts()
    
    return rss({
      title: SITE.title,
      description: SITE.description,
      site: context.site ?? SITE.href,
      items: posts.map((post) => ({
        title: getEntryTitle(post),
        description: post.data.description,
        pubDate: getEntryDate(post),
        link: getEntryHref(post),
      })),
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}