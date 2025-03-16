/*

yarn tsn vitest.script.ts

 */

import path from 'node:path'
import { fastGlob, fs2, runScript } from '@naturalcycles/nodejs-lib'
const projectDir = path.join(`${__dirname}/..`)

runScript(async () => {
  const files = fastGlob.sync(`${projectDir}/{src,scripts}/**/*.test.ts`)
  // console.log(files)

  files.forEach(filePath => {
    let s = fs2.readText(filePath)
    s =
      `import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from 'vitest'\n\n` + s
    fs2.writeFile(filePath, s)
    console.log(`saved ${filePath}`)
  })
})
