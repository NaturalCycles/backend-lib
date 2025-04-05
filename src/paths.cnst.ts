import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const projectDir = join(__dirname, '/..')
export const resourcesDir = `${projectDir}/resources`
export const srcDir = `${projectDir}/src`
export const testDir = `${srcDir}/test`
