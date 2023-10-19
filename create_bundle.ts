import {
  bundle,
  type BundleOptions,
} from "https://deno.land/x/emit@0.24.0/mod.ts"

export async function createBundle(
  sourceFile: string,
  options?: BundleOptions,
): Promise<string> {
  const timeStart = performance.now()
  const { code } = await bundle(sourceFile, options)
  const duration = performance.now() - timeStart
  console.info(`building "${sourceFile}" done. (${duration}ms)`)
  return code
}