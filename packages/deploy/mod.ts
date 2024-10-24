import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts"
import { bundle } from "https://deno.land/x/emit@0.24.0/mod.ts"

export const DEV = Deno.env.get("APP_DEV") === "true"
export const PORT = +Deno.env.get("APP_PORT")!
export const PUBLIC = Deno.env.get("APP_PUBLIC") || Deno.cwd()
export const TARGET = Deno.env.get("APP_TARGET")!
export const SOURCE = Deno.env.get("APP_SOURCE")!
export const SOURCE_ROOT = Deno.env.get("APP_SOURCE_ROOT")!
export const IMPORT_MAP = Deno.env.get("APP_IMPORT_MAP")

let build = await createBundle()

export const app = new Application()
export const router = new Router()
const fsArray = [SOURCE_ROOT, SOURCE]
router.get(TARGET, (ctx) => {
  ctx.response.type = "js"
  ctx.response.body = build
})
app.use(router.routes())
app.use(router.allowedMethods())
app.use(async (ctx, next) => {
  try {
    await ctx.send({ root: PUBLIC, index: "./index.html" })
  } catch {
    await next()
  }
})
app.use(async (ctx, next) => {
  try {
    await ctx.send({ root: PUBLIC, path: "./index.html" })
  } catch {
    await next()
  }
})

if (DEV === true) {
  runDev()
}

async function createBundle(): Promise<string> {
  const timeStart = performance.now()
  const { code } = await bundle(SOURCE, {
    importMap: IMPORT_MAP,
    compilerOptions: {
      inlineSources: DEV,
      inlineSourceMap: DEV,
    },
  })
  const finalCode = code
  const duration = (performance.now() - timeStart).toFixed()
  const units = ["B", "KB", "MB"]
  let size = finalCode.length, i = 0
  for (i; size > 1000; i++) {
    size /= 1000
  }
  const bytes = size.toFixed()
  console.info(`app built (${duration}ms, ${bytes}${units[i]})`)
  return finalCode
}

async function runDev() {
  let built = false
  for await (const _event of Deno.watchFs(fsArray)) {
    if (built) {
      continue
    }
    build = await createBundle()
    built = true
    setTimeout(() => built = false, 100)
  }
}
