/**
 * 读取设置
 * @module
 * @see `config/config.schema.json`
 */

import { readFile } from 'fs/promises'
import { parse } from 'yaml'



interface Config {
    sources_path: string,
    output: {
        json_path: string
    }
}

const defaults: Config = {
    sources_path: "config/sources.json",
    output: {
        json_path: "output/notices.json"
    }
}



async function _import_config({ config_path = 'config/config.yml' } = {}) {
    const file = await readFile(config_path)
    const given = parse(file.toString())
    return Object.assign({}, defaults, given) as Config
}

export default await _import_config()
