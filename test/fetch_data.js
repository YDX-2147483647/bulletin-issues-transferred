import { fetch_all_sources } from "../dist/notice.js"
import { import_sources } from '../dist/notices_saver.js'

fetch_all_sources(await import_sources())
