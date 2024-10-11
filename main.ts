import jwb from './retrieve/publishers/jwb.ts'

if (import.meta.main) {
  console.log(await jwb.retrieve())
}
