# Documentation

## 引用结构

> 此节仅适用于 [2a87d6af](https://github.com/YDX-2147483647/bulletin-issues-transferred/tree/2a87d6af693342ac8aceb7311077445367a60e33)（≈ v2.0.0-alpha.4）。

### `plugin`地位不清

存在越级引用、被引用。

```mermaid
flowchart LR
    / --> plugin/cli
    / --> core
    / --> util
    core --> util
    util --> core
    plugin/cli --> core
    plugin/cli --> util
    plugin/ding --> core
    plugin/ding --> /
    plugin/rss --> core

```

### 文件夹不是模块

存在文件夹互相引用。而且没有封装，太散了。

```mermaid
flowchart LR
    index --> update_notices
    index --> plugin/cli/index
    update_notices --> core/notices_saver
    update_notices --> core/sources/index
    update_notices --> util/notices
    update_notices --> util/my_date
    update_notices --> plugin/cli/index
    core/notices_saver --> core/config
    core/notices_saver --> core/models
    %% core/notices_saver -.-> fs/promises
    %% core/notices_saver -.-> chalk
    %% core/config -.-> fs/promises
    %% core/config -.-> yaml
    core/sources/index --> core/models
    core/sources/index --> core/sources/by_selectors
    core/sources/index --> core/sources/special
    %% core/sources/by_selectors -.-> fs/promises
    %% core/sources/by_selectors -.-> node-fetch
    %% core/sources/by_selectors -.-> jsdom
    core/sources/by_selectors --> util/my_date
    core/sources/by_selectors --> core/config
    core/sources/by_selectors --> core/models
    %% core/sources/special -.-> node-fetch
    core/sources/special --> util/my_date
    core/sources/special --> core/models
    util/notices --> core/models
    util/notices --> util/my_date
    %% plugin/cli/index -.-> chalk
    %% plugin/cli/index -.-> cli-progress
    %% plugin/cli/index -.-> node-fetch
    plugin/cli/index --> core/models
    plugin/cli/index --> util/my_date
    %% plugin/ding/index -.-> fs/promises
    %% plugin/ding/index -.-> yaml
    plugin/ding/index --> core/config
    plugin/ding/index --> plugin/ding/bot
    %% plugin/ding/bot -.-> node_fetch
    plugin/ding/bot --> plugin/ding/sign
    plugin/ding/examples/update --> update_notices
    plugin/ding/examples/update --> plugin/ding/index
    %% plugin/rss/index -.-> xml
    %% plugin/rss/index -.-> chalk
    %% plugin/rss/index -.-> fs/promises
    plugin/rss/index --> core/models

```

去除`plugin/ding`和`plugin/rss`，合并`core/sources/`后如下。

```mermaid
flowchart LR
    index --> update_notices
    index --> plugin/cli/index
    update_notices --> core/notices_saver
    update_notices --> core/sources/
    update_notices --> util/notices
    update_notices --> util/my_date
    update_notices --> plugin/cli/index
    core/notices_saver --> core/config
    core/notices_saver --> core/models
    %% core/notices_saver -.-> fs/promises
    %% core/notices_saver -.-> chalk
    %% core/config -.-> fs/promises
    %% core/config -.-> yaml
    %% core/sources/ -.-> fs/promises
    %% core/sources/ -.-> node-fetch
    %% core/sources/ -.-> jsdom
    core/sources/ --> core/config
    core/sources/ --> core/models
    core/sources/ --> util/my_date
    util/notices --> core/models
    util/notices --> util/my_date
    %% plugin/cli/index -.-> chalk
    %% plugin/cli/index -.-> cli-progress
    %% plugin/cli/index -.-> node-fetch
    plugin/cli/index --> core/models
    plugin/cli/index --> util/my_date

    subgraph core
        core/config
        core/notices_saver
        core/models
        core/sources/
    end

```

## Models

```mermaid
classDiagram
    class Notice {
        + link: string
        + title: string
        + date: Date | null
        + source?: Source
        + source_name: string

        + id: String
    }

    class Source {
        + name: string
        + full_name: string
        + alt_name: string[0..*]
        + url: string
        + guide: string[0..*]

        + id: string
    }

    Notice "0..*" -- "1" Source
```

## 备忘录

### 钩子

我们使用 [before-after-hook](https://www.npmjs.com/package/before-after-hook) 的`HookCollection`，请参考它的文档。

> [octokit.js](https://github.com/octokit/request.js) 也使用了`HookCollection`，亦可作参考。

```typescript
// 预留钩子示例

import type { HookCollection } from 'before-after-hook'

type HooksType = {
    foo: {
        Options: FooOptions
        Result: FooResult
    }
}

function _foo (options: FooOptions): FooResult {
    // …
}

export function foo ({ _hook, ...options }: {
    _hook: HookCollection<HooksType>
} & FooOptions): Promise<FooResult> {
    return _hook('foo', _foo, options)
}
```

```typescript
// 使用钩子示例

import { Hook } from 'before-after-hook'

const _hook = new Hook.Collection<HooksType>()
_hook.before('fetch', before_hook)

await foo({
    ...options,
    _hook
})
```

插件可以在 before hook 中向`options`添加自己的属性，供相应 after hook 使用。预留钩子时要避免把自定义属性传丢了。
