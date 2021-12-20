import { fetch_all_sources } from "../dist/notices_util.js"
import { import_sources_by_selectors } from '../dist/notices_saver.js'

fetch_all_sources(await import_sources_by_selectors())
