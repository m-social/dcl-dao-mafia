import defaultCanvas from '../canvas'
import UiGameWindow from './base/game'

export default class NightWindow extends UiGameWindow {
  private night: UIText
  private vote: UIText
  private isMafia = false

  private mafiaInfo: UIText
  private mafias: UIText[] = []

  constructor(canvas = defaultCanvas) {
    super(canvas)

    const night = new UIText(this.container)
    const vote = new UIText(this.container)
    const mafiaInfo = new UIText(this.container)

    night.value = 'The mafia votes who to kill.'
    night.hTextAlign = 'left'
    night.vTextAlign = 'top'
    night.vAlign = 'top'
    night.hAlign = 'center'
    // night.height = 100
    night.fontSize = 14
    night.textWrapping = true
    night.width = '100%'
    night.visible = false

    vote.value = 'Vote who to kill now!'
    vote.hTextAlign = 'left'
    vote.vTextAlign = 'center'
    vote.vAlign = 'top'
    vote.hAlign = 'center'
    vote.positionY = -25
    // vote.height = 100
    vote.fontSize = 22
    vote.textWrapping = true
    vote.width = '100%'
    vote.visible = false
    vote.outlineColor = Color4.Red()
    vote.outlineWidth = 0.15

    mafiaInfo.value = 'Other mafias:'
    mafiaInfo.hTextAlign = 'left'
    mafiaInfo.vTextAlign = 'top'
    mafiaInfo.vAlign = 'top'
    mafiaInfo.hAlign = 'center'
    mafiaInfo.positionY = -80
    // night.height = 100
    mafiaInfo.fontSize = 14
    mafiaInfo.textWrapping = true
    mafiaInfo.width = '100%'
    mafiaInfo.visible = false

    this.night = night
    this.vote = vote

    this.mafiaInfo = mafiaInfo
  }

  private changeMafia(isMafia: boolean) {
    this.isMafia = isMafia

    log(isMafia, this.isMafia)

    if (this.isMafia) {
      this.vote.visible = this.isVisible
      // this.rules.positionY = -200
    } else {
      this.vote.visible = false
      // this.rules.positionY = -120
    }
  }

  public setRole(role: string | null) {
    super.setRole(role)

    this.changeMafia(role === 'mafia')
  }

  public changeDay(day: number) {
    this.changePhase(`NIGHT ${day}`)
  }

  public updateMafia(mafias: string[]) {
    if (!this.isMafia) {
      return
    }

    if (this.visible()) {
      this.mafiaInfo.visible = mafias.length !== 0
    }

    let y = -85

    this.mafias.splice(mafias.length).forEach((p) => {
      p.visible = false
    })

    mafias.forEach((m, i) => {
      if (i < this.mafias.length) {
        const text = this.mafias[i]

        text.value = `${i + 1}.  ${m}`
        text.visible = this.isVisible
      } else {
        const text = new UIText(this.container)

        text.value = `${i + 1}.  ${m}`
        text.hTextAlign = 'left'
        text.vTextAlign = 'center'
        text.vAlign = 'top'
        text.hAlign = 'left'
        text.positionY = y
        text.visible = this.isVisible
        text.fontSize = 12

        this.mafias.push(text)
      }
      y -= 25
    })

    this.background.height = Math.max(400, -y + 255)
  }

  protected visibility(value: boolean): void {
    super.visibility(value)

    this.night.visible = value

    this.vote.visible = this.isMafia && value
    this.mafiaInfo.visible = this.isMafia && this.mafias.length > 0 && value
    this.mafias.forEach((v) => (v.visible = this.isMafia && value))
  }
}

export const nightUi = new NightWindow()
