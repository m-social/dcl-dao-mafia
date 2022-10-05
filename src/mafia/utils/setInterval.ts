import { Interval } from '@dcl/ecs-scene-utils'

export default function setInterval(ms: number, callback: (selfDestroy: () => void) => void) {
  const entity = new Entity()

  entity.addComponent(new Interval(ms, () => callback(() => engine.removeEntity(entity))))

  engine.addEntity(entity)

  return entity
}
