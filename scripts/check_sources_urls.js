import checkLinks from 'check-links'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const file = await readFile(path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../config/sources_by_selectors.json',
))
const urls = JSON.parse(file.toString()).sources.map(s => s.url)

const results = await checkLinks(urls)

const failures = Object.entries(results).filter(([url, result]) => result.status !== 'alive')
if (failures.length > 0) {
    console.log('❌ Some URLs are dead or invalid:')
    console.log(Object.fromEntries(failures))
    process.exitCode = 1
} else {
    console.log('🎉 All URLs are alive!')
}
