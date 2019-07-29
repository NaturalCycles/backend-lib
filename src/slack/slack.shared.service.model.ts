export interface SlackMessage {
  username?: string
  channel?: string
  icon_url?: string
  icon_emoji?: string
  text: string
}

export interface SlackSharedServiceCfg {
  /**
   * Undefined means slack is disabled.
   */
  webhookUrl?: string

  defaults?: Partial<SlackMessage>
}
