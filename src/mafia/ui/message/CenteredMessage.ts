import defaultCanvas from '../canvas'

// TODO: do we need to extend `Entity`?
export default class CenteredMessage {
  canvas: UICanvas
  background: UIContainerRect
  text: UIText
  blockPointer: boolean

  constructor({
    text,
    width,
    height,
    bgColor = Color4.White(),
    textColor = Color4.Black(),
    xPadding = 0,
    textSize = 20,
    textFont = new Font(Fonts.SansSerif_SemiBold),
    borderThickness = 2,
    blockPointer = false,
    visible = false,
    canvas = defaultCanvas
  }: {
    text: string
    width: number
    height: number
    bgColor?: Color4
    textColor?: Color4
    textSize?: number
    textFont?: Font
    xPadding?: number
    borderThickness?: number
    blockPointer?: boolean
    visible?: boolean
    canvas?: UICanvas
  }) {
    this.blockPointer = blockPointer

    // canvas start
    this.canvas = canvas
    this.canvas.isPointerBlocker = this.blockPointer
    // canvas end

    // background start
    this.background = new UIContainerRect(canvas)
    this.background.hAlign = 'center'
    this.background.vAlign = 'center'

    this.background.width = width
    this.background.height = height

    this.background.thickness = Math.max(0, borderThickness)

    this.background.color = bgColor

    this.background.isPointerBlocker = this.blockPointer
    // background end

    //text start
    this.text = new UIText(this.background)

    this.text.adaptWidth = false
    this.text.textWrapping = true

    this.text.width = width - Math.max(0, xPadding) * 2

    this.text.value = text

    this.text.hAlign = 'center'
    this.text.vAlign = 'center'

    this.text.fontSize = textSize
    this.text.font = textFont

    this.text.vTextAlign = 'center'
    this.text.hTextAlign = 'center'

    this.text.color = textColor

    this.text.isPointerBlocker = this.blockPointer
    // text end

    if (visible) {
      this.show()
    } else {
      this.hide()
    }
  }

  get visible() {
    return this.canvas.visible
  }

  hide() {
    this.canvas.visible = false
    this.background.visible = false
    this.text.visible = false
  }

  show() {
    this.text.visible = true
    this.background.visible = true
    this.canvas.visible = true
  }

  toggle() {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }
}
