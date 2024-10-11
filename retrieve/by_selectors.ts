/**
 * 用选择器抓取通知
 *
 * 先获取静态网页，然后用CSS选择器从中提取信息。
 *
 * @module
 */

import { DOMParser, type Element } from 'jsr:@b-fuze/deno-dom'
import type { Notice } from '../types.ts'
import { parse_date } from './parse_date.ts'

/** 用于抓取通知的CSS选择器 */
export interface SelectorsInit {
  /**
   * 每项通知
   *
   * 可能是`<li>`。
   *
   * @example '.subRight li'
   */
  rows: string

  /**
   * 这一项的链接及标题
   *
   * 一般是`<a>`。
   *
   * @default 'a'
   */
  link?: string

  /**
   * 这一项的标题
   *
   * 一般不需要。如果链接和标题不是同一元素，可用`link`定位链接，用`title`定位标题。
   * @example 'h3'
   */
  title?: string

  /**
   * 这一项的发布时刻
   *
   * `null`代表没有声明发布时刻。
   *
   * @default 'span'
   */
  published_at?: string | null
}

interface Selectors extends SelectorsInit {
  rows: string
  link: string
  title: string
  published_at: string | null
}

function normalize_selectors(selectors: SelectorsInit): Selectors {
  const {
    rows,
    link = 'a',
    title,
    published_at = 'span',
  } = selectors

  return { rows, link, published_at, title: title ?? link }
}

/**
 * 从HTML解析通知
 *
 * @param html
 * @param selectors
 * @param base_url 页面的 URL，用于解析相对链接
 * @returns
 */
export function parse(
  html: string,
  selectors: SelectorsInit,
  base_url: string,
): Notice[] {
  const s = normalize_selectors(selectors)

  const document = new DOMParser().parseFromString(html, 'text/html')
  const rows = document?.querySelectorAll(s.rows) ?? []

  return Array.from(rows).map((row) => {
    const link = row.querySelector(s.link) as Element
    const title = row.querySelector(s.title) as Element
    const published_at = s.published_at !== null
      ? row.querySelector(s.published_at)
      : null

    return {
      url: (new URL(link.getAttribute('href') as string, base_url)).href,
      title: title.textContent.trim(),
      published_at: published_at
        ? parse_date(published_at.textContent)
        : undefined,
      retrieved_at: new Date(),
    }
  })
}
