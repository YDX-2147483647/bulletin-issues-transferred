/** 通知发布来源 */
export interface Publisher {
  /**
   * 名称
   *
   * 会直接显示给同学，尽量简称，尤其不要包含“通知”几个字。
   */
  name: string

  /**
   * 通知页面的URL
   *
   * 指向人可读的页面，未必和程序抓取通知使用的URL相同。
   */
  url: string

  /**
   * 补充描述
   *
   * 记录全名、别名。如果通知页面不好找，可介绍如何一步步导航过去。
   */
  description?: string

  /** 抓取通知 */
  retrieve: () => Promise<Notice[]>
}

/** 通知 */
export interface Notice {
  /** 正文的URL */
  url: string
  /** 标题 */
  title: string

  /**
   * 通知发布时刻
   *
   * 0. 若通知本身未声明何时发布，留空；
   * 1. 若只声明了日期（精确到天），只记录日期；
   * 2. 若声明了具体时刻，完整记录。
   *
   * 采用服务器所在时区。
   */
  published_at?: Date

  /**
   * 网页抓取时刻
   *
   * 以能保证通知存在的最早时刻为准：
   * - 如果抓取过程较长，采用结束时刻；
   * - 如果多次访问过，采用初次抓取到的时刻。
   */
  retrieved_at: Date
}
