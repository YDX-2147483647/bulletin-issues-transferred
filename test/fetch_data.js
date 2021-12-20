import { fetch_all_sources } from "../dist/notices_util.js"
import { import_sources } from "../dist/sources_importer.js"

fetch_all_sources(await import_sources())
