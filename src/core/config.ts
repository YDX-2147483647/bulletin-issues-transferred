/**
 * 读取设置
 * @module
 * @see `config/config.schema.json`
 */

import { parse } from 'npm:yaml'

interface Config {
    sources_by_selectors: string
    json_path: string
    save_for: number
    // deno-lint-ignore no-explicit-any
    [propName: string]: any
}

const defaults: Config = {
    sources_by_selectors: 'config/sources_by_selectors.json',
    json_path: 'output/notices.json',
    save_for: 90,
}

async function _import_config(
    { config_path = 'config/config.yml' } = {},
): Promise<Config> {
    const file = await Deno.readTextFile(config_path)
    const given = parse(file.toString())
    return Object.assign({}, defaults, given) as Config
}

export default await _import_config() as Config
