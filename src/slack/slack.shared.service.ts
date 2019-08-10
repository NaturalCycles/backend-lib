import { Debug } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import * as got from 'got'
import {
  SlackAttachmentField,
  SlackMessage,
  SlackSharedServiceCfg,
} from './slack.shared.service.model'

const DEFAULTS = (): SlackMessage => ({
  username: 'backend-lib',
  channel: '#log',
  icon_emoji: ':spider_web:',
  text: 'no text',
})

const log = Debug('backend-lib:slack')

export class SlackSharedService<CTX = any> {
  static INSTANCE_ALIAS = ['slackService']

  constructor (private slackServiceCfg: SlackSharedServiceCfg) {}

  // Convenient method
  async send (text: string, ctx?: CTX): Promise<void> {
    await this.sendMsg(
      {
        text,
      },
      ctx,
    )
  }

  async sendMsg (_msg: SlackMessage, ctx?: CTX): Promise<void> {
    const { webhookUrl } = this.slackServiceCfg

    log(...[_msg.text, _msg.kv, _msg.attachments].filter(Boolean))

    if (!webhookUrl) return

    this.processKV(_msg)

    const body = {
      ...DEFAULTS(),
      ...this.slackServiceCfg.defaults,
      ..._msg,
    }

    this.decorateMsg(body, ctx)

    await got
      .post(webhookUrl, {
        json: true,
        body,
      })
      .catch(ignored => {}) // ignore, cause slack is weirdly returning non-json text "ok" response
  }

  /**
   * Mutates msg.
   * To be overridden.
   */
  protected decorateMsg (msg: SlackMessage, ctx?: CTX): void {
    const tokens: string[] = []

    tokens.push(dayjs().toPretty())
    tokens.push(msg.text)

    msg.text = tokens.join('\n')
  }

  kvToFields (kv: Record<string, any>): SlackAttachmentField[] {
    return Object.entries(kv).map(([k, v]) => ({
      title: k,
      value: String(v),
      short: String(v).length < 80,
    }))
  }

  /**
   * mutates
   */
  private processKV (msg: SlackMessage): void {
    if (!msg.kv) return

    msg.attachments = (msg.attachments || []).concat({
      fields: this.kvToFields(msg.kv),
    })

    delete msg.kv
  }
}
