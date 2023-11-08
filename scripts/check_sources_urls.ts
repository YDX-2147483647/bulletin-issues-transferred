import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import checkLinks from 'npm:check-links@^2.1.2'

const file = await readFile(path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../config/sources_by_selectors.json',
))
const sources = JSON.parse(file.toString()).sources as { url: string }[]
const urls = sources.map((s) => s.url)

const results = await checkLinks(urls)

const failures = Object.entries(results).filter(([_url, result]) =>
    result.status !== 'alive'
)
if (failures.length > 0) {
    console.log('❌ Some URLs are dead or invalid:')
    console.log(Object.fromEntries(failures))
    Deno.exit(1)
} else {
    console.log('🎉 All URLs are alive!')
}
