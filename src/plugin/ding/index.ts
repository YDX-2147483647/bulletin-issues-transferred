/**
 * i 北理机器人
 * @module
 */

import { readFile } from 'fs/promises'
import { parse } from 'yaml'

import config from '../../core/config.js'

import Robot from './bot.js'

async function load_config () {
    const { ding: { secrets_path } } = config
    const file = await readFile(secrets_path)
    return parse(file.toString()) as { webhook: string, secret: string }
}

const robot = new Robot(await load_config())

export default robot
