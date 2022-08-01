import { displayAnnouncement } from '@dcl/ui-scene-utils'
import { getPlayerData } from '@decentraland/Players'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import { PLAYER_KILLED_MESSAGE_DURATION_S, TELEPORT_KILLED_PLAYER_TO } from 'src/constants/index'
import votingMessageBus from 'src/p2p/voting'
import userData from 'src/user/data'

votingMessageBus.on('kick', async ({ id }) => {
  if (id === (await userData())?.userId) {
    await movePlayerTo(TELEPORT_KILLED_PLAYER_TO)
    displayAnnouncement(`You were killed :(`, PLAYER_KILLED_MESSAGE_DURATION_S, Color4.Red())
  } else {
    const data = await getPlayerData({ userId: id })
    displayAnnouncement(
      `${data?.displayName ?? 'Unknown player'} were killed!`,
      PLAYER_KILLED_MESSAGE_DURATION_S,
      Color4.Red()
    )
  }
})
