import { defaultTexture, arrowsTexture } from '../texture'
import defaultCanvas from '../canvas'
import UiWindow from './base/index'

export default class VotingResultsWindow extends UiWindow {
  private helpText: UIText
  private participants: UIText[] = []
  private closeButton: UIImage
  private closeText: UIText
  private closeBackground: UIContainerRect
  private closeIcon: UIImage

  private isOpen = false

  constructor(canvas = defaultCanvas) {
    super(canvas)

    const X_OFFSET = -300

    this.background.positionX = X_OFFSET
    this.background.width = 265

    const helpText = new UIText(this.background)

    helpText.value = 'Results of the latest day voting:'
    helpText.hTextAlign = 'left'
    helpText.vTextAlign = 'top'
    helpText.vAlign = 'top'
    helpText.hAlign = 'center'
    helpText.paddingTop = 15
    helpText.height = 100
    helpText.fontSize = 14
    helpText.textWrapping = true
    helpText.width = '90%'
    helpText.visible = false

    this.helpText = helpText

    const closeButton = new UIImage(this.canvas, defaultTexture)

    closeButton.paddingBottom = 5
    closeButton.paddingLeft = 5
    closeButton.paddingRight = 5
    closeButton.paddingTop = 5
    closeButton.vAlign = 'top'
    closeButton.hAlign = 'right'
    closeButton.positionX = X_OFFSET
    closeButton.positionY = 60
    closeButton.width = 165
    closeButton.height = 50
    closeButton.sourceWidth = 20
    closeButton.sourceHeight = 20
    closeButton.sourceLeft = 900
    closeButton.sourceTop = 800
    closeButton.visible = false
    closeButton.onClick = new OnPointerDown(() => this.onClick())
    closeButton.isPointerBlocker = true

    this.closeButton = closeButton

    const closeBg = new UIContainerRect(closeButton)

    closeBg.height = '100%'
    closeBg.width = '100%'
    closeBg.color = Color4.Black()
    closeBg.opacity = 0.8
    closeBg.isPointerBlocker = false

    this.closeBackground = closeBg

    const closeIcon = new UIImage(closeBg, arrowsTexture)
    closeIcon.vAlign = 'center'
    closeIcon.hAlign = 'right'
    closeIcon.positionX = -10
    closeIcon.width = 30
    closeIcon.height = 30
    closeIcon.isPointerBlocker = false

    closeIcon.sourceHeight = 150
    closeIcon.sourceWidth = 150
    closeIcon.sourceLeft = 0
    closeIcon.sourceTop = 0

    this.closeIcon = closeIcon

    const closeText = new UIText(closeBg)

    closeText.value = 'Show results'
    closeText.color = Color4.White()
    closeText.vTextAlign = 'center'
    closeText.vAlign = 'center'
    closeText.hAlign = 'right'
    closeText.hTextAlign = 'right'
    closeText.positionX = -50
    closeText.fontSize = 14
    // leaveText.fontAutoSize = true
    closeText.visible = false
    closeText.isPointerBlocker = false

    this.closeText = closeText
  }

  private onClick() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  public open(showIfHidden = false) {
    this.isOpen = true
    this.closeText.value = 'Hide results'
    this.closeIcon.sourceLeft = 150
    if (showIfHidden) {
      this.show()
    } else {
      this.updateContentVisibility()
    }
  }

  public close() {
    this.isOpen = false
    this.closeText.value = 'Show results'
    this.closeIcon.sourceLeft = 0
    this.updateContentVisibility()
  }

  private updateContentVisibility() {
    const showContent = this.isOpen && this.isVisible

    this.background.visible = showContent
    this.helpText.visible = showContent
    this.participants.forEach((v) => (v.visible = showContent))
  }

  public override hide() {
    super.hide()

    this.close()
  }

  protected override visibility(value: boolean) {
    this.isVisible = value

    this.closeText.visible = value
    this.closeButton.visible = value
    this.closeBackground.visible = value
    this.closeIcon.visible = value

    this.updateContentVisibility()
  }

  private static trimName(name: string) {
    return name.length > 12 ? `${name.substring(0, 10)}...` : name
  }

  public updateResults(participants: [who: string, whom: string][]) {
    log(this.helpText.height)

    // const size = Math.max(this.participants.length, participants.length)

    let y = -30

    this.participants.splice(participants.length).forEach((p) => {
      log(p)
      p.visible = false
    })

    participants.forEach(([who, whom], i) => {
      const value = `${i + 1}. ${VotingResultsWindow.trimName(who)} - ${VotingResultsWindow.trimName(whom)}`

      if (i < this.participants.length) {
        const text = this.participants[i]

        text.value = value
        text.visible = this.isVisible
      } else {
        const text = new UIText(this.background)

        text.value = value
        text.hTextAlign = 'left'
        text.vTextAlign = 'center'
        text.vAlign = 'top'
        text.hAlign = 'left'
        text.positionY = y
        text.positionX = 15
        text.visible = this.isVisible
        text.fontSize = 12

        this.participants.push(text)
      }
      y -= 25
    })

    this.background.height = Math.max(400, -y + 75)
  }
}
