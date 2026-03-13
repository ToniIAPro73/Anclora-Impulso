export const uiMotion = {
  card: "ui-motion-card",
  button: "ui-motion-button",
  frame: "ui-motion-frame",
} as const

export type UiMotionSurface = keyof typeof uiMotion
