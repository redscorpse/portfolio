import { QuartzTransformerPlugin } from "../types"

export interface Options {
  replaceCodeBlockTitle: boolean
}

const defaultOptions: Options = {
  replaceCodeBlockTitle: true,
}

const quartzCodeBlocksTitleRegex = new RegExp(/file:/, "g")

export const ReplaceMDText: QuartzTransformerPlugin<Partial<Options> | undefined> = (
  userOpts,
) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "ReplaceMDText",
    textTransform(_ctx, src) {
      if (opts.replaceCodeBlockTitle) {
        src = src.toString()
        src = src.replaceAll(quartzCodeBlocksTitleRegex, (value) => {
          return value.replaceAll("file:", "title=")
        })
      }
      return src
    },
  }
}

