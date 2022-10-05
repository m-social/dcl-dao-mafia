import { defaultTexture } from '../texture'
import defaultCanvas from '../canvas'
import UiWindow from './base/index'

export default class WinnerWindow extends UiWindow {
  private winner: UIText
  private phase: UIText

  private help: UIText

  private countdown: UIText

  private leave: UIImage
  private leaveText: UIText

  constructor(canvas = defaultCanvas) {
    super(canvas)

    this.background.height = 350

    const role = new UIText(this.background)
    const phase = new UIText(this.background)

    const help = new UIText(this.background)

    const countdown = new UIText(this.background)

    const leave = new UIImage(this.background, defaultTexture)
    const leaveText = new UIText(leave)

    role.hTextAlign = 'left'
    role.vTextAlign = 'top'
    role.vAlign = 'top'
    role.hAlign = 'center'
    role.positionY = -25
    // role.height = 100
    role.fontSize = 16
    role.textWrapping = true
    role.width = '90%'
    role.visible = false

    phase.value = 'POST-GAME'
    phase.hTextAlign = 'right'
    phase.vTextAlign = 'top'
    phase.vAlign = 'top'
    phase.hAlign = 'center'
    phase.positionY = -25
    // phase.height = 100
    phase.fontSize = 16
    phase.textWrapping = true
    phase.width = '90%'
    phase.color = Color4.Green()
    phase.visible = false

    help.value =
      'You will automatically participate in next games. If you wanna leave, press the "Leave the queue" button bellow.'
    help.hTextAlign = 'left'
    help.vTextAlign = 'top'
    help.vAlign = 'top'
    help.hAlign = 'center'
    help.positionY = -100
    // help.height = 100
    help.fontSize = 16
    help.textWrapping = true
    help.width = '90%'
    help.visible = false

    countdown.hTextAlign = 'left'
    countdown.vTextAlign = 'top'
    countdown.vAlign = 'top'
    countdown.hAlign = 'center'
    countdown.positionY = -225
    // help.height = 100
    countdown.fontSize = 16
    countdown.textWrapping = true
    countdown.width = '90%'
    countdown.visible = false

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

    this.winner = role
    this.phase = phase

    this.help = help
    this.countdown = countdown

    this.leave = leave
    this.leaveText = leaveText
  }

  public set onClick(value: OnPointerDown | null) {
    this.leave.onClick = value
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
        this.winner.value = ''
        return
    }

    this.winner.value = `The ${name} won!`
  }

  public updateCountdown(remaining: number | null) {
    if (remaining === null) {
      this.countdown.value = ''
      return
    }

    this.countdown.value = `Next round will start in ${remaining} second${remaining === 1 ? '' : 's'}`
  }

  protected visibility(value: boolean): void {
    super.visibility(value)

    this.winner.visible = value
    this.phase.visible = value

    this.help.visible = value
    this.countdown.visible = value

    this.leaveText.visible = value
    this.leave.visible = value
  }
}

export const winnerUi = new WinnerWindow()
