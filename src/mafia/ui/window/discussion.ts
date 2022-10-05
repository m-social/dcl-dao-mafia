import defaultCanvas from '../canvas'
import UiGameWindow from './base/game'

export default class DiscussionWindow extends UiGameWindow {
  private day: UIText
  private action: UIText

  constructor(canvas = defaultCanvas) {
    super(canvas)

    this.phase.color = Color4.Green()

    const info = new UIText(this.container)
    const action = new UIText(this.container)

    info.value = 'Villagers are trying to determine who the mafia is.'
    info.hTextAlign = 'left'
    info.vTextAlign = 'top'
    info.vAlign = 'top'
    info.hAlign = 'center'
    // day.positionY = -85
    // night.height = 100
    info.fontSize = 14
    info.textWrapping = true
    info.width = '100%'
    info.visible = false

    action.value = 'Discuss with other players who the mafia is.'
    action.hTextAlign = 'left'
    action.vTextAlign = 'center'
    action.vAlign = 'top'
    action.hAlign = 'center'
    action.positionY = -65
    // vote.height = 100
    action.fontSize = 22
    action.textWrapping = true
    action.width = '100%'
    action.visible = false
    action.outlineColor = Color4.Red()
    action.outlineWidth = 0.15

    this.day = info
    this.action = action
  }

  public override setRole(role: string | null) {
    super.setRole(role)

    if (role === 'mafia') {
      this.action.value = 'Try not to give yourself away.'
      this.action.outlineWidth = 0
      // this.vote.visible = this.isVisible
      // this.rules.positionY = -200
    } else {
      this.action.value = 'Discuss with other players who the mafia is.'
      this.action.outlineWidth = 0.15
    }
  }

  public changeDay(day: number) {
    super.changePhase(`DAY ${day}`)
  }

  // public updateMafia() {

  // }

  public override updateCountdown(time: number) {
    if (time <= 0) {
      this.countdown.value = 'Starting day voting...'
      this.countdown.color = Color4.White()
    } else {
      this.countdown.value = `Discussion will end in ${time} second${time === 1 ? '' : 's'}`

      if (time < 5) {
        this.countdown.color = Color4.Red()
      } else if (time < 10) {
        this.countdown.color = Color4.Yellow()
      } else {
        this.countdown.color = Color4.White()
      }
    }
  }

  protected override visibility(value: boolean): void {
    super.visibility(value)

    this.day.visible = value

    this.action.visible = value
  }
}
