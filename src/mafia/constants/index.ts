export const MIN_PLAYER_COUNT = 4
export const MAX_PLAYERS_COUNT = 16
export const MAFIA_FORMULA = (participantsCount: number) => Math.floor(participantsCount / MIN_PLAYER_COUNT)

export const GAME_PHASES_DURATION_MS = 60000
export const DAY_DISCUSSION_DURATION_MS = 60000
export const WAIT_BEFORE_START_MS = 60000
export const WAIT_BEFORE_VOTING_RESULTS = 3500
export const WAIT_AFTER_GAME_END_MS = 20000
export const WAIT_ROLES_BEFORE_CANCEL_MS = 10000

/**
 * @deprecated
 */
export const WAIT_AFTER_ROLES_MS = 3500

export const WINNER_MESSAGE_DURATION_S = 10
export const PLAYER_KILLED_MESSAGE_DURATION_S = 5
export const PLAYER_INACTIVE_MESSAGE_DURATION_S = 5

export const TELEPORT_KILLED_PLAYER_TO = { x: 0, y: 2, z: 0 }

/**
 * @deprecated
 */
export const SHOW_ROLE_ICON = true

/**
 * @deprecated
 */
export const SHOW_PHASE_LABEL = true

export const KICK_VOTING_PROMPT_EXAMPLE = true

export const START_PHASE = 'discussion'
export const START_DAY = 1
