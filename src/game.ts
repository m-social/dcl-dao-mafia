import * as ui from '@dcl/ui-scene-utils'
import playersData from './players/info'
import { hasActiveKick, canStartVote, anotherInProgress, kickVote, remainingSecondsBeforeKick } from './players/kicker'
import { onSelfEnterLeave } from './scene/enter-leave'
import { showKickPrompt } from './ui/kick-prompt'
import createSelectPlayerPrompt from './ui/select-player'
import userData from './user/data'

function tryShowKickPrompt(kicker: () => void) {
  if (hasActiveKick()) {
    ui.displayAnnouncement('Another voting is in progress!', 5, Color4.Red())
  } else if (!canStartVote()) {
    const remaining = remainingSecondsBeforeKick()
    ui.displayAnnouncement(`Wait ${remaining} second${remaining === 1 ? '' : 's'} to start new vote!`, 5, Color4.Red())
  } else if (anotherInProgress()) {
    ui.displayAnnouncement(`Another voting is in progress!`, 5)
  } else {
    kicker()
  }
}

Input.instance.subscribe('BUTTON_UP', ActionButton.SECONDARY, false, () => {
  tryShowKickPrompt(showKickPrompt)
})

Input.instance.subscribe('BUTTON_UP', ActionButton.PRIMARY, false, () => {
  tryShowKickPrompt(async () => {
    const data = await userData()

    createSelectPlayerPrompt(
      playersData.filter(({ userId }) => userId !== data?.userId),
      (p) => {
        void kickVote(p.displayName)
      }
    )
  })
})

onSelfEnterLeave('leave', () => {
  ui.hideAnnouncements()
})
