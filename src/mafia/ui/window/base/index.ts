import defaultCanvas from '../../canvas'

export default class UiWindow {
  protected canvas: UICanvas
  protected background: UIContainerRect
  protected isVisible = false

  constructor(canvas: UICanvas = defaultCanvas) {
    this.canvas = canvas

    const bg = new UIContainerRect(this.canvas)

    bg.hAlign = 'right'
    bg.vAlign = 'top'
    bg.positionX = -10
    bg.opacity = 0.8
    bg.width = 280
    bg.height = 400
    bg.color = Color4.Black()
    bg.visible = false

    this.background = bg
  }

  protected visibility(value: boolean) {
    this.isVisible = value
    this.background.visible = value
  }

  public show() {
    this.visibility(true)
  }

  public hide() {
    this.visibility(false)
  }

  public visible() {
    return this.isVisible
  }
}
