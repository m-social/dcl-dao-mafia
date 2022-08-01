// import * as utils from '@dcl/ecs-scene-utils'
import { Interval } from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { getPhase } from './p2p/phases'
import phasesMessageBus from './p2p/phases'
// import getUserData from './getUserDarta'

// import { showKickPrompt } from './kick/kick-prompt'
// import { showKickVote } from './kick/kick-vote'
// import { anotherInProgress, canStartVote, hasActiveKick } from './kick/kicker'

import { isHead, participate, _unsafeParticipants } from './mafia/participants'

import { onSelfEnterLeave } from './scene/enter-leave'

import { hasActiveKick, canStartVote, anotherInProgress } from './players/kicker'
import { showKickPrompt } from './ui/kick-prompt'

import './mafia/kick'
import { KICK_VOTING_PROMPT_EXAMPLE } from './constants/index'

// import CenteredMessage from './ui/message/CenteredMessage'

/// --- Set up a system ---

// class RotatorSystem {
//   // this group will contain every entity that has a Transform component
//   group = engine.getComponentGroup(Transform);

//   update(dt: number) {
//     // iterate over the entities of the group
//     for (const entity of this.group.entities) {
//       // get the Transform component of the entity
//       const transform = entity.getComponent(Transform);

//       // mutate the rotation
//       transform.rotate(Vector3.Up(), dt * 150);
//     }
//   }
// }

// Add a new instance of the system to the engine
// engine.addSystem(new RotatorSystem());цфф

/// --- Spawner function ---

const cube = new Entity()

cube.addComponent(
  new Transform({
    position: new Vector3(7, 1, 7)
  })
)

cube.addComponent(new BoxShape())

const redMaterial = new Material()
redMaterial.albedoColor = Color4.Red()

cube.addComponent(redMaterial)

const cubeOnPointerDown = new OnPointerDown(
  async () => {
    if (!getPhase()) {
      const v = await participate()

      if (v) {
        // cubeOnPointerDown.hoverText = 'Click to leave Mafia the Game'

        if (!getPhase()) {
          ui.displayAnnouncement("You have been added to Mafia the Game's queue")
        }
        if (!isHead()) {
          cube.removeComponent(cubeOnPointerDown)
        } else {
          cubeOnPointerDown.hoverText = 'Click to stop Mafia the Game'
        }
      } else {
        ui.displayAnnouncement('Oops, something broke! Try again please!')
      }
    } else {
      phasesMessageBus.emit('cancel', {})
      cubeOnPointerDown.hoverText = 'Click to participate Mafia the Game'
    }
    // }
    // add players to mafia list
  },
  { button: ActionButton.POINTER, hoverText: 'Click to participate Mafia the Game' }
)

cube.addComponent(cubeOnPointerDown)

onSelfEnterLeave('leave', () => {
  cubeOnPointerDown.hoverText = 'Click to participate Mafia the Game'
  cube.addComponentOrReplace(cubeOnPointerDown)
})

const billboard = new Entity()
const text = new TextShape('Mafia the Game')
text.billboard = true
text.color = Color3.Black()

text.hTextAlign = 'center'
text.vTextAlign = 'center'

text.outlineColor = Color3.White()
text.outlineWidth = 0.1

text.fontSize = 8

billboard.addComponent(text)

billboard.addComponent(
  new Transform({
    position: new Vector3(0, 1.25, 0)
  })
)

billboard.setParent(cube)

engine.addEntity(cube)

function tryShowKickPrompt() {
  if (hasActiveKick()) {
    ui.displayAnnouncement('Another voting is in progress!', 5, Color4.Red())
  } else if (!canStartVote()) {
    ui.displayAnnouncement('Wait 20 seconds to start new vote!', 5, Color4.Red())
  } else if (anotherInProgress()) {
    ui.displayAnnouncement(`Another voting is in progress!`, 5)
  } else {
    showKickPrompt()
  }
}

if (KICK_VOTING_PROMPT_EXAMPLE) {
  Input.instance.subscribe('BUTTON_UP', ActionButton.SECONDARY, false, () => {
    tryShowKickPrompt()
  })
}

onSelfEnterLeave('leave', () => {
  ui.hideAnnouncements()
})
