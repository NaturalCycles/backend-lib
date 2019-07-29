import { StringMap } from '@naturalcycles/js-lib'

export interface SlackMessage {
  username?: string
  channel?: string
  icon_url?: string
  icon_emoji?: string
  text: string
  attachments?: SlackMessageAttachment[]

  /**
   * Keys-values will be rendered as MessageAttachment with Fields
   */
  kv?: StringMap<any>
}

// Taken from here: https://github.com/slackapi/node-slack-sdk/blob/master/packages/types/src/index.ts
export interface SlackMessageAttachment {
  // blocks?: (KnownBlock | Block)[];
  fallback?: string // either this or text must be defined
  color?: 'good' | 'warning' | 'danger' | string
  pretext?: string
  author_name?: string
  author_link?: string // author_name must be present
  author_icon?: string // author_name must be present
  title?: string
  title_link?: string // title must be present
  text?: string // either this or fallback must be defined
  fields?: {
    title: string
    value: string
    short?: boolean
  }[]
  image_url?: string
  thumb_url?: string
  footer?: string
  footer_icon?: string // footer must be present
  ts?: number
  // actions?: AttachmentAction[];
  callback_id?: string
  mrkdwn_in?: ('pretext' | 'text' | 'fields')[]
}

export interface SlackSharedServiceCfg {
  /**
   * Undefined means slack is disabled.
   */
  webhookUrl?: string

  defaults?: Partial<SlackMessage>
}
