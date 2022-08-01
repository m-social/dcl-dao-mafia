import * as ui from '@dcl/ui-scene-utils'
import { onSelfEnterLeave as onScene } from 'src/scene/enter-leave'
import emitt from 'src/utils/emitt'

const emitter = emitt<{
  accept: { userId: string }
  reject: { userId: string }
  answer: { userId: string; value: boolean }
}>()

const kickVoteUI = new ui.OptionPrompt(
  'Vote Kick Player',
  'Kick "PlayerName"?',
  () => {
    log('kick')
  },
  () => {
    log('keep')
  },
  'No',
  'Yes'
)
kickVoteUI.background.hAlign = 'right'

hideKickVote()

export default kickVoteUI

export function setKickPlayerName(name: string) {
  kickVoteUI.text.value = `Kick "${name}"?`
}

export function showKickVote() {
  kickVoteUI.show()
  kickVoteUI.title.visible = true

  Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.PRIMARY, kickVoteUI.EButtonAction)
  Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.SECONDARY, kickVoteUI.FButtonAction)

  kickVoteUI.buttonEIcon.visible = false
  kickVoteUI.buttonFIcon.visible = false

  kickVoteUI.buttonELabel.positionX = 0
  kickVoteUI.buttonFLabel.positionX = 0
}

export function hideKickVote() {
  kickVoteUI.hide()
}

export function startVote(name: string, id: string) {
  setKickPlayerName(name)
  kickVoteUI.onReject = () => {
    emitter.emit('accept', { userId: id })
    emitter.emit('answer', { userId: id, value: true })
  }
  kickVoteUI.onAccept = () => {
    emitter.emit('reject', { userId: id })
    emitter.emit('answer', { userId: id, value: false })
  }

  showKickVote()
}

onScene('leave', () => {
  hideKickVote()
})

export function cancelVote(_id: string) {
  hideKickVote()
}

export const { on: onKickVote, off: offKickVote } = emitter
