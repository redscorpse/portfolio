// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
import foldCodeButton from "./scripts/foldCodeButton.inline"
import otherScripts from "./scripts/otherScripts.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = clipboardScript
Body.css = clipboardStyle
Body.afterDOMLoaded = foldCodeButton
Body.afterDOMLoaded = otherScripts

export default (() => Body) satisfies QuartzComponentConstructor
