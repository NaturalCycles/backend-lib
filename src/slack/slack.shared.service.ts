import { Debug } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import * as got from 'got'
import {
  SlackAttachmentField,
  SlackMessage,
  SlackSharedServiceCfg,
} from './slack.shared.service.model'

const GAE = !!process.env.GAE_INSTANCE

const DEFAULTS = (): SlackMessage => ({
  username: 'backend-lib',
  channel: '#log',
  icon_emoji: ':spider_web:',
  text: 'no text',
})

const log = Debug('nc:backend-lib:slack')

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
    const tokens = [dayjs().toPretty()]

    // AppEngine-specific decoration
    if (GAE && ctx && typeof ctx === 'object' && typeof (ctx as any).header === 'function') {
      tokens.push(
        (ctx as any).header('x-appengine-country')!,
        (ctx as any).header('x-appengine-city')!,
        // ctx.header('x-appengine-user-ip')!,
      )
    }

    msg.text = [tokens.filter(Boolean).join(': '), msg.text].join('\n')
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
