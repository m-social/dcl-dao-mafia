import defaultCanvas from '../canvas'
import UiGameWindow from './base/game'

export default class DayWindow extends UiGameWindow {
  private day: UIText
  private vote: UIText

  constructor(canvas = defaultCanvas) {
    super(canvas)

    this.phase.color = Color4.Green()

    const day = new UIText(this.container)
    const vote = new UIText(this.container)

    day.value = 'Villagers are trying to determine who the mafia is.'
    day.hTextAlign = 'left'
    day.vTextAlign = 'top'
    day.vAlign = 'top'
    day.hAlign = 'center'
    // day.positionY = -85
    // night.height = 100
    day.fontSize = 14
    day.textWrapping = true
    day.width = '100%'
    day.visible = false

    vote.value = 'Vote for the one you consider mafia.'
    vote.hTextAlign = 'left'
    vote.vTextAlign = 'center'
    vote.vAlign = 'top'
    vote.hAlign = 'center'
    vote.positionY = -65
    // vote.height = 100
    vote.fontSize = 22
    vote.textWrapping = true
    vote.width = '100%'
    vote.visible = false
    vote.outlineColor = Color4.Red()
    vote.outlineWidth = 0.15

    this.day = day
    this.vote = vote
  }

  public override setRole(role: string | null) {
    super.setRole(role)

    if (role === 'mafia') {
      this.vote.value = 'Vote for anyone.'
      this.vote.outlineWidth = 0
      // this.vote.visible = this.isVisible
      // this.rules.positionY = -200
    } else {
      this.vote.value = 'Vote for the one you consider mafia.'
      this.vote.outlineWidth = 0.15
    }
  }

  public changeDay(day: number) {
    super.changePhase(`DAY ${day}`)
  }

  // public updateMafia() {

  // }

  protected override visibility(value: boolean): void {
    super.visibility(value)

    this.day.visible = value

    this.vote.visible = value
  }
}

export const dayUi = new DayWindow()
