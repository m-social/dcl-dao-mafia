import defaultCanvas from '../../canvas'
import UiWindow from './index'

export default class UiGameWindow extends UiWindow {
  protected role: UIText
  protected rules: UIText
  protected phase: UIText
  protected container: UIContainerRect
  protected countdown: UIText

  protected countdownSubject = 'Voting'

  constructor(canvas = defaultCanvas) {
    super(canvas)

    const role = new UIText(this.background)
    const rules = new UIText(this.background)
    const phase = new UIText(this.background)
    const countdown = new UIText(this.background)

    this.container = new UIContainerRect(this.background)
    // this.container.stackOrientation = UIStackOrientation.VERTICAL

    // this.container.adaptWidth = true
    // this.container.spacing = 25
    this.container.width = '90%'
    this.container.hAlign = 'center'
    this.container.vAlign = 'top'
    this.container.positionY = -85

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

    countdown.hTextAlign = 'left'
    countdown.vTextAlign = 'top'
    countdown.vAlign = 'top'
    countdown.hAlign = 'center'
    countdown.positionY = -50
    // role.height = 100
    countdown.fontSize = 14
    countdown.textWrapping = true
    countdown.width = '90%'
    countdown.visible = false

    rules.value =
      'Game rules:\nTo win, the mafia must kill all villagers.\nVillagers, in turn, should try to uncover all the mafiosi before they are killed.'
    rules.hTextAlign = 'left'
    rules.vTextAlign = 'bottom'
    rules.vAlign = 'bottom'
    rules.hAlign = 'center'
    rules.positionY = 25
    // vote.height = 100
    rules.fontSize = 14
    rules.lineSpacing = 20
    rules.textWrapping = true
    rules.width = '90%'
    rules.visible = false
    rules.color = Color4.Yellow()
    rules.opacity = 0.85

    this.role = role
    this.rules = rules
    this.phase = phase
    this.countdown = countdown
  }

  public setRole(role: string | null) {
    let roleName: string

    switch (role) {
      case 'mafia':
        roleName = 'Mafia'
        break
      case 'civil':
        roleName = 'Villager'
        break
      default:
        this.role.value = ''
        return
    }

    this.role.value = `You're ${roleName}!`
  }

  public updateCountdown(time: number) {
    if (time <= 0) {
      this.countdown.value = 'Processing of voting results...'
      this.countdown.color = Color4.White()
    } else {
      this.countdown.value = `Voting will end in ${time} second${time === 1 ? '' : 's'}`

      if (time < 5) {
        this.countdown.color = Color4.Red()
      } else if (time < 10) {
        this.countdown.color = Color4.Yellow()
      } else {
        this.countdown.color = Color4.White()
      }
    }
  }

  protected visibility(value: boolean): void {
    super.visibility(value)

    this.countdown.visible = value
    this.role.visible = value
    this.rules.visible = value
    this.phase.visible = value
  }

  protected changePhase(phaseName: string) {
    this.phase.value = phaseName
  }
}
