import { defaultTexture } from '../texture'
import defaultCanvas from '../canvas'
import UiWindow from './base/index'

export default class KilledWindow extends UiWindow {
  private info: UIText
  private phase: UIText

  private betterLuck: UIText

  private help: UIText

  private leave: UIImage
  private leaveText: UIText

  constructor(canvas = defaultCanvas) {
    super(canvas)

    this.background.height = 350

    const info = new UIText(this.background)
    const phase = new UIText(this.background)

    const betterLuck = new UIText(this.background)

    const help = new UIText(this.background)

    const leave = new UIImage(this.background, defaultTexture)
    const leaveText = new UIText(leave)

    info.value = 'You were killed!'
    info.hTextAlign = 'left'
    info.vTextAlign = 'top'
    info.vAlign = 'top'
    info.hAlign = 'center'
    info.positionY = -25
    // role.height = 100
    info.fontSize = 16
    info.textWrapping = true
    info.width = '90%'
    info.visible = false

    phase.value = 'DEAD'
    phase.hTextAlign = 'right'
    phase.vTextAlign = 'top'
    phase.vAlign = 'top'
    phase.hAlign = 'center'
    phase.positionY = -25
    // phase.height = 100
    phase.fontSize = 16
    phase.textWrapping = true
    phase.width = '90%'
    phase.color = Color4.Red()
    phase.visible = false

    betterLuck.value = 'Better luck next time :)'
    betterLuck.hTextAlign = 'left'
    betterLuck.vTextAlign = 'top'
    betterLuck.vAlign = 'top'
    betterLuck.hAlign = 'center'
    betterLuck.positionY = -75
    // help.height = 100
    betterLuck.fontSize = 20
    betterLuck.textWrapping = true
    betterLuck.width = '90%'
    betterLuck.visible = false

    help.value =
      "Please wait for the results of the game.\n\nIf you don't wanna play anymore, click on the 'Leave the queue' button below."
    help.hTextAlign = 'left'
    help.vTextAlign = 'top'
    help.vAlign = 'top'
    help.hAlign = 'center'
    help.positionY = -125
    // help.height = 100
    help.fontSize = 14
    help.textWrapping = true
    help.width = '90%'
    help.visible = false

    leave.paddingBottom = 5
    leave.paddingLeft = 5
    leave.paddingRight = 5
    leave.paddingTop = 5
    leave.vAlign = 'bottom'
    leave.width = '100%'
    leave.height = 50
    leave.sourceWidth = 174
    leave.sourceHeight = 46
    leave.sourceLeft = 698
    leave.sourceTop = 662
    leave.visible = false

    leaveText.value = 'Leave the queue'
    leaveText.color = Color4.Black()
    leaveText.vTextAlign = 'center'
    leaveText.vAlign = 'center'
    leaveText.hAlign = 'center'
    leaveText.hTextAlign = 'center'
    leaveText.fontSize = 16
    // leaveText.fontAutoSize = true
    leaveText.visible = false
    leaveText.isPointerBlocker = false

    this.info = info
    this.phase = phase

    this.betterLuck = betterLuck
    this.help = help

    this.leave = leave
    this.leaveText = leaveText
  }

  public set onClick(value: OnPointerDown | null) {
    this.leave.onClick = value
  }

  public hideButton() {
    this.leave.visible = false
  }

  public setWinner(winner: string) {
    let name: string

    switch (winner) {
      case 'mafia':
        name = 'Mafia'
        break
      case 'civil':
        name = 'Villagers'
        break
      default:
        this.info.value = ''
        return
    }

    this.info.value = `The ${name} won!`
  }

  public updateCountdown(remaining: number | null) {
    if (remaining === null) {
      this.help.value = ''
      return
    }

    this.help.value = `Next round will start in ${remaining} second${remaining === 1 ? '' : 's'}`
  }

  protected visibility(value: boolean): void {
    super.visibility(value)

    this.info.visible = value
    this.phase.visible = value

    this.betterLuck.visible = value
    this.help.visible = value

    this.leaveText.visible = value
    this.leave.visible = value
  }
}

export const winnerUi = new KilledWindow()
