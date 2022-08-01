import * as ui from '@dcl/ui-scene-utils'
import { UserData } from '@decentraland/Players'

export default function createSelectPlayerPrompt(players: UserData[], onSelect: (user: UserData) => void) {
  const height = players.length * 35 + 150

  const prompt = new ui.CustomPrompt(ui.PromptStyles.LIGHT, undefined, height)

  prompt.addText('Vote for a player', 0, height / 2 - 25, Color4.Red(), 30)

  let selected: UserData | null = null

  const checkboxes = players.map((p, i) => {
    const y = height / 2 - 85 - i * 35

    const cb = prompt.addCheckbox(
      p.displayName,
      0,
      y,
      () => {
        selected = p
        checkboxes.forEach((other) => {
          if (other !== cb) {
            other.uncheck()
          }
        })
      },
      () => {
        selected = null
      }
    )

    const TEXT_WIDTH = 200
    const CHECKBOX_ICON_SIZE = 20

    cb.image.width = cb.image.height = CHECKBOX_ICON_SIZE
    cb.label.fontSize = 20
    cb.label.width = TEXT_WIDTH

    cb.image.positionX = -(CHECKBOX_ICON_SIZE + TEXT_WIDTH) / 2

    return cb
  })

  prompt.addButton(
    'Select',
    0,
    -height / 2 + 35,
    () => {
      if (selected) {
        onSelect(selected)
        prompt.hide()
      }
    },
    ui.ButtonStyles.ROUNDBLACK
  )

  return prompt
}
