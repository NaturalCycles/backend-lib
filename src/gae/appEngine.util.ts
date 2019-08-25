const { GAE_INSTANCE } = process.env

export function isGAE (): boolean {
  return !!GAE_INSTANCE
}
