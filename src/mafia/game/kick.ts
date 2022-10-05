import { displayAnnouncement } from '@dcl/ui-scene-utils'
import { getPlayerData } from '@decentraland/Players'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import {
  PLAYER_INACTIVE_MESSAGE_DURATION_S,
  PLAYER_KILLED_MESSAGE_DURATION_S,
  TELEPORT_KILLED_PLAYER_TO
} from '../constants/index'
import { onRoles } from '../events/roles'
import { isActivePlayer } from './roles'

onRoles('self-kill', async () => {
  await movePlayerTo(TELEPORT_KILLED_PLAYER_TO)
  displayAnnouncement(`You were killed :(`, PLAYER_KILLED_MESSAGE_DURATION_S, Color4.Red())
})

onRoles('other-kill', async ({ id }) => {
  if (!isActivePlayer()) {
    return
  }

  const data = await getPlayerData({ userId: id })
  displayAnnouncement(
    `${data?.displayName ?? 'Unknown player'} were killed!`,
    PLAYER_KILLED_MESSAGE_DURATION_S,
    Color4.Red()
  )
})

onRoles('self-inactive', () => {
  displayAnnouncement('You were kicked due to inactivity', PLAYER_INACTIVE_MESSAGE_DURATION_S, Color4.Red())
})
