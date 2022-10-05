import * as ui from '@dcl/ui-scene-utils'
import selfEnterLeaveEmitter from '../../events/self-leave-enter'
import { kickVote } from '../../players/kicker'

const kickPromptUI = new ui.FillInPrompt(
  'Kick Player',
  (str) => {
    void kickVote(str)
  },
  'Kick',
  'Player name',
  false
)
kickPromptUI.hide()

selfEnterLeaveEmitter.on('leave', () => {
  kickPromptUI.hide()
})

export function showKickPrompt() {
  kickPromptUI.show()

  Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.PRIMARY, kickPromptUI.EButtonAction)
  kickPromptUI.icon.visible = false
  kickPromptUI.buttonLabel.positionX = 0
}

export default kickPromptUI
