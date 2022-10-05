// import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { getPhase } from './p2p/phases'
import phasesMessageBus from './p2p/phases'
// import getUserData from './getUserDarta'

// import { showKickPrompt } from './kick/kick-prompt'
// import { showKickVote } from './kick/kick-vote'
// import { anotherInProgress, canStartVote, hasActiveKick } from './kick/kicker'

import { isHead, participate, _unsafeParticipants } from './game/participants'

import selfEnterLeaveEmitter from './events/self-leave-enter'

import { onParticipant } from './events/participants'

import './game/kick'

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

export default function setupMafia({
  position,
  size,
  billboard: withBillboard = true
}: {
  position?: Vector3
  size?: Vector3
  billboard?: boolean
} = {}) {
  const table = new Entity()

  table.addComponent(
    new Transform({
      position: position ?? new Vector3(8, -0.1, 8),
      scale: size ?? new Vector3(1, 1, 1)
      // scale: new Vector3(20, 20, 20)
    })
  )

  table.addComponent(new GLTFShape('models/mafia/table/mafia-table.glb'))

  const redMaterial = new Material()
  redMaterial.albedoColor = Color4.Red()

  table.addComponent(redMaterial)
  const tableOnPointerDown = new OnPointerDown(
    async () => {
      if (!getPhase() || !isHead()) {
        // const isActive = !!getPhase()

        const v = await participate()

        if (typeof v !== 'boolean') {
          return
        }

        if (v) {
          // cubeOnPointerDown.hoverText = 'Click to leave Mafia the Game'
          // if (!isHead()) {
          table.removeComponent(tableOnPointerDown)
          // } else {
          //   cubeOnPointerDown.hoverText = 'Click to stop Mafia the Game'
          // }
        } else {
          ui.displayAnnouncement('Oops, something broke! Try again please!')
        }
      } else {
        phasesMessageBus.emit('cancel', { autostart: false })
        tableOnPointerDown.hoverText = 'Click to participate Mafia the Game'
      }
      // }
      // add players to mafia list
    },
    { button: ActionButton.POINTER, hoverText: 'Click to participate Mafia the Game' }
  )

  table.addComponent(tableOnPointerDown)

  const activateTable = () => {
    tableOnPointerDown.hoverText = 'Click to participate Mafia the Game'
    table.addComponentOrReplace(tableOnPointerDown)
  }

  selfEnterLeaveEmitter.on('leave', activateTable)

  // phasesMessageBus.on('end', activateCube)

  onParticipant('self-leave', activateTable)

  if (withBillboard) {
    const billboard = new Entity()
    const text = new TextShape('Mafia the Game')
    text.color = Color3.Black()

    text.hTextAlign = 'center'
    text.vTextAlign = 'center'

    text.outlineColor = Color3.White()
    text.outlineWidth = 0.1

    text.fontSize = 8

    billboard.addComponent(text)

    billboard.addComponent(
      new Transform({
        position: new Vector3(0, 2.25, 0),
        scale: new Vector3(0.6, 0.6, 0.6)
      })
    )

    billboard.addComponent(new Billboard())

    billboard.setParent(table)
  }

  engine.addEntity(table)

  // function tryShowKickPrompt() {
  //   if (hasActiveKick()) {
  //     ui.displayAnnouncement('Another voting is in progress!', 5, Color4.Red())
  //   } else if (!canStartVote()) {
  //     ui.displayAnnouncement('Wait 20 seconds to start new vote!', 5, Color4.Red())
  //   } else if (anotherInProgress()) {
  //     ui.displayAnnouncement(`Another voting is in progress!`, 5)
  //   } else {
  //     showKickPrompt()
  //   }
  // }

  // if (KICK_VOTING_PROMPT_EXAMPLE) {
  //   Input.instance.subscribe('BUTTON_UP', ActionButton.SECONDARY, false, () => {
  //     tryShowKickPrompt()
  //   })
  // }

  selfEnterLeaveEmitter.on('leave', () => {
    ui.hideAnnouncements()
  })
}
