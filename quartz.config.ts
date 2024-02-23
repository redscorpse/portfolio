import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "𝕽𝖊𝖉𝖘",
    enableSPA: true,
    locale: "en-US",
    enablePopovers: true,
    analytics: {
      provider: 'google', tagId: 'G-X8P1904KPE',
    },
    baseUrl: "redscorpse.sytes.net",
    ignorePatterns: ["private", "templates", ".obsidian",
    ],
    defaultDateType: "created",
    theme: {
      cdnCaching: true,
      typography: {
        header: "Barlow",
        body: "Barlow",
        code: "JetBrainsMonoNF",
      },
      colors: {
        lightMode: {
          light: "#fdfdfd" /* "#faf8f8" */,
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#6e5e8e" /*"#284b63"*/,
          tertiary:  "#84a59d" /* "#84a59d" */,
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#0c0b10" /* "#161618" */,
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#9187c5" /*"#7b97aa"*/,
          tertiary: "#84a59d" /* "#84a59d" */,
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        // you can add 'git' here for last modified from Git
        // if you do rely on git for dates, ensure defaultDateType is 'modified'
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: true }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "absolute" }),
      Plugin.Description(),
      Plugin.ReplaceMDText(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: false,
        enableRSS: false,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
