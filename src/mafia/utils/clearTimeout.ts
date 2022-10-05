import { Delay } from '@dcl/ecs-scene-utils'

export default function clearTimeout(timeout: Entity | null | undefined) {
  if (!timeout) {
    return
  }

  engine.removeEntity(timeout)
  timeout.removeComponent(Delay)
}
