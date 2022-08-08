/**
 * 读取设置
 * @module
 * @see `config/config.schema.json`
 */

import { readFile } from 'fs/promises'
import { parse } from 'yaml'

interface Config {
    sources_by_selectors: string
    json_path: string
    save_for: number
    [propName: string]: any
}

const defaults: Config = {
    sources_by_selectors: 'config/sources_by_selectors.json',
    json_path: 'output/notices.json',
    save_for: 90,
}

async function _import_config ({ config_path = 'config/config.yml' } = {}): Promise<Config> {
    const file = await readFile(config_path)
    const given = parse(file.toString())
    return Object.assign({}, defaults, given) as Config
}

export default await _import_config() as Config
