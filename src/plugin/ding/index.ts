/**
 * i 北理机器人
 * @module
 */

import { parse } from 'npm:yaml'

import { config } from '../../core/index.ts'

import Robot from './bot.ts'

async function load_config() {
    // @ts-ignore 允许扩展设置
    const { ding: { secrets_path } }: { ding: { secrets_path: string } } =
        config
    const file = await Deno.readTextFile(secrets_path)
    return parse(file.toString()) as { webhook: string; secret: string }
}

const robot = new Robot(await load_config())

export default robot
