export function isGAE (): boolean {
  return !!process.env.GAE_INSTANCE
}
