export const MIN_PLAYER_COUNT = 4
export const MAFIA_FORMULA = (participantsCount: number) => Math.floor(participantsCount / MIN_PLAYER_COUNT)

export const GAME_PHASES_DURATION_MS = 15000
export const WAIT_BEFORE_START_MS = 2500
export const WAIT_BEFORE_VOTING_RESULTS = 3500

export const WINNER_MESSAGE_DURATION_S = 10
export const PLAYER_KILLED_MESSAGE_DURATION_S = 5

export const TELEPORT_KILLED_PLAYER_TO = { x: 0, y: 2, z: 0 }

export const SHOW_ROLE_ICON = true
export const SHOW_PHASE_LABEL = true

export const KICK_VOTING_PROMPT_EXAMPLE = true
