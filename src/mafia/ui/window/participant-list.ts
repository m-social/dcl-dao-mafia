import { MIN_PLAYER_COUNT } from '../../constants/index'
import { defaultTexture } from '../texture'
import defaultCanvas from '../canvas'
import UiWindow from './base/index'

export default class ParticipantListWindow extends UiWindow {
  private addedInfo: UIText
  private gameStartInfo: UIText
  private participantsHeader: UIText
  private participants: UIText[] = []
  private remaining: UIText
  private leave: UIImage
  private leaveText: UIText

  constructor(canvas = defaultCanvas) {
    super(canvas)

    // const info = new UIText(bg)
    const addedInfo = new UIText(this.background)
    const gameStartInfo = new UIText(this.background)
    const participantsHeader = new UIText(this.background)
    const remaining = new UIText(this.background)
    const leave = new UIImage(this.background, defaultTexture)
    const leaveText = new UIText(leave)

    addedInfo.value = "You were added to the Mafia the Game's queue."
    addedInfo.hTextAlign = 'left'
    addedInfo.vTextAlign = 'top'
    addedInfo.vAlign = 'top'
    addedInfo.hAlign = 'center'
    addedInfo.paddingTop = 15
    addedInfo.height = 100
    addedInfo.fontSize = 12
    addedInfo.textWrapping = true
    addedInfo.width = '90%'
    addedInfo.visible = false

    gameStartInfo.value = `The game will start when at least ${MIN_PLAYER_COUNT} players connect.`
    gameStartInfo.hTextAlign = 'left'
    gameStartInfo.vTextAlign = 'top'
    gameStartInfo.vAlign = 'top'
    gameStartInfo.hAlign = 'center'
    gameStartInfo.positionY = -55
    gameStartInfo.height = 100
    gameStartInfo.fontSize = 12
    gameStartInfo.textWrapping = true
    gameStartInfo.width = '90%'
    gameStartInfo.visible = false

    participantsHeader.value = 'Players in the queue:'
    participantsHeader.hTextAlign = 'left'
    participantsHeader.vTextAlign = 'top'
    participantsHeader.vAlign = 'top'
    participantsHeader.hAlign = 'center'
    participantsHeader.positionY = -100
    participantsHeader.height = 100
    participantsHeader.fontSize = 12
    participantsHeader.textWrapping = true
    participantsHeader.width = '90%'
    participantsHeader.visible = false

    remaining.hTextAlign = 'left'
    remaining.vTextAlign = 'center'
    remaining.vAlign = 'top'
    remaining.hAlign = 'left'
    remaining.positionX = 15
    remaining.fontSize = 14
    remaining.textWrapping = true
    remaining.width = '90%'
    remaining.visible = false

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

    this.addedInfo = addedInfo
    this.remaining = remaining
    this.gameStartInfo = gameStartInfo
    this.participantsHeader = participantsHeader
    this.leave = leave
    this.leaveText = leaveText
  }

  public set onClick(value: OnPointerDown | null) {
    this.leave.onClick = value
  }

  protected override visibility(value: boolean) {
    super.visibility(value)

    this.leaveText.visible = value
    this.leave.visible = value
    this.addedInfo.visible = value

    this.gameStartInfo.visible = value
    this.participantsHeader.visible = value

    this.remaining.visible = this.participants.length < MIN_PLAYER_COUNT && value

    this.participants.forEach((v) => (v.visible = value))
  }

  public updateTimeout(timeout: number) {
    if (timeout <= 0) {
      this.gameStartInfo.value = 'Starting the game...'
    } else {
      this.gameStartInfo.value = `The game will start in ${timeout} second${timeout === 1 ? '' : 's'}.`
    }
  }

  public setActiveGameStartText() {
    this.gameStartInfo.value = 'Another game is already in progress. Wait for the next game.'
  }

  public hideLeaveButton() {
    this.leave.visible = false
    this.leaveText.visible = false
  }

  public updateParticipants(participants: string[], hasActiveTimeout = false) {
    log(this.addedInfo.height)

    // const size = Math.max(this.participants.length, participants.length)

    let y = -parseInt(this.addedInfo.height as string) - 5

    this.participants.splice(participants.length).forEach((p) => {
      log(p)
      p.visible = false
    })

    participants.forEach((p, i) => {
      if (i < this.participants.length) {
        const text = this.participants[i]

        text.value = `${i + 1}.  ${p}`
        text.visible = this.isVisible
      } else {
        const text = new UIText(this.background)

        text.value = `${i + 1}.  ${p}`
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

    if (participants.length < MIN_PLAYER_COUNT) {
      const count = MIN_PLAYER_COUNT - participants.length
      this.remaining.value = `${count} more player${count % 10 === 1 ? '' : 's'} need to join to start the game.`

      this.remaining.positionY = y - 20
      this.remaining.visible = this.isVisible

      y -= 55

      this.gameStartInfo.value = `The game will start when at least ${MIN_PLAYER_COUNT} players connect.`
    } else {
      this.remaining.visible = false

      if (!hasActiveTimeout) {
        this.gameStartInfo.value = 'The game will start soon...'
      }
    }

    // for (let i = 0; i < size; ++i) {
    //   if (i < participants.length) {
    //     if (i >= this.participants.length) {
    //       break
    //     }

    //     this.participants[i].visible = false
    //     continue
    //   }

    //   const p = participants[i]

    //   if (i < this.participants.length) {
    //     const text = this.participants[i]

    //     text.value = `${i + 1}.  ${p}`
    //     text.visible = this.isVisible
    //   } else {
    //     const text = new UIText(this.background)

    //     text.value = `${i + 1}.  ${p}`
    //     text.hTextAlign = 'left'
    //     text.vTextAlign = 'center'
    //     text.vAlign = 'top'
    //     text.hAlign = 'left'
    //     text.positionY = y
    //     text.positionX = 15
    //     text.visible = this.isVisible

    //     this.participants.push(text)
    //   }
    //   y -= 25
    // }

    this.background.height = Math.max(400, -y + 75)
  }
}
