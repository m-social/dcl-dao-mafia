import * as ui from '@dcl/ui-scene-utils'
import { UserData } from '@decentraland/Players'
import { checkboxTexture, defaultTexture } from '../texture'

export default function createSelectPlayerPrompt(
  players: UserData[],
  onSelect: (user: UserData) => void,
  title = 'Vote for a player'
) {
  const lines = (title.match(/\n/g)?.length ?? 0) + 1

  const height = players.length * 35 + 130 + 25 * lines

  const prompt = new ui.CustomPrompt(ui.PromptStyles.LIGHT, 400, height)

  const { text } = prompt.addText(title, 0, -15, Color4.Red(), 25)

  // text.fontAutoSize = true
  // text.textWrapping = true
  text.width = '65%'
  text.vTextAlign = 'top'
  text.vAlign = 'top'

  let selected: UserData | null = null

  function uncheckCheckbox(cb: ui.CustomPromptCheckBox) {
    cb.image.source = checkboxTexture
    cb.image.sourceLeft = 9
    cb.image.sourceTop = 166
    cb.image.sourceWidth = 128
    cb.image.sourceHeight = 128
  }

  function checkCheckbox(cb: ui.CustomPromptCheckBox) {
    cb.image.source = checkboxTexture
    cb.image.sourceLeft = 5
    cb.image.sourceTop = 0
    cb.image.sourceWidth = 128
    cb.image.sourceHeight = 128
  }

  const checkboxes = players.map((p, i) => {
    const y = height / 2 - 60 - lines * 25 - i * 35

    const onCheck = () => {
      checkCheckbox(cb)

      selected = p
      checkboxes.forEach(({ checkbox: other }) => {
        if (other !== cb) {
          other.uncheck()
          uncheckCheckbox(other)
        }
      })
    }

    const onUncheck = () => {
      uncheckCheckbox(cb)

      selected = null
    }

    const TEXT_WIDTH = 200

    const clickArea = new UIImage(prompt.background, defaultTexture)

    clickArea.positionX = 0
    clickArea.positionY = y
    clickArea.width = TEXT_WIDTH + 24
    clickArea.height = 24
    clickArea.sourceWidth = 20
    clickArea.sourceHeight = 20
    clickArea.sourceLeft = 900
    clickArea.sourceTop = 800
    clickArea.isPointerBlocker = true

    clickArea.onClick = new OnPointerDown(() => {
      if (cb.checked) {
        cb.uncheck()
        onUncheck()
      } else {
        cb.check()
        onCheck()
      }
    })

    const cb = prompt.addCheckbox(p.displayName, 0, y, onCheck, onUncheck)

    uncheckCheckbox(cb)

    const CHECKBOX_ICON_SIZE = 20

    cb.image.width = cb.image.height = CHECKBOX_ICON_SIZE
    cb.label.fontSize = 20
    cb.label.width = TEXT_WIDTH

    cb.image.positionX = -(CHECKBOX_ICON_SIZE + TEXT_WIDTH) / 2

    clickArea.height = cb.image.height

    return { checkbox: cb, trap: clickArea }
  })

  prompt.hide = function () {
    this.background.visible = false
    this.closeIcon.visible = false

    for (const element of this.elements) {
      element.hide()
    }

    for (const { trap: area } of checkboxes) {
      area.visible = false
    }

    log('custom prompt hide')
  }

  prompt.show = function () {
    this.background.visible = true
    this.closeIcon.visible = true

    for (const element of this.elements) {
      element.show()
    }

    for (const { trap: area } of checkboxes) {
      area.visible = true
    }

    log('custom prompt show')
  }

  prompt.addButton(
    'Vote',
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
