// @ts-ignore
// import clipboardScript from "./scripts/clipboard.inline"
import afterDOMScript from "./scripts/afterDOMLoaded.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function Body({ children }: QuartzComponentProps) {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = afterDOMScript //clipboardScript
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor
