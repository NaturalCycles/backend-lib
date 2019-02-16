import * as got from 'got'
import { timeUtil } from '../datetime/time.util'

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
}

export class SlackSharedService {
  constructor (private cfg: SlackSharedServiceCfg) {}

  protected defaults (): SlackMessage {
    return {
      username: 'backend-lib',
      channel: '#log',
      icon_emoji: ':spider_web:',
      text: 'no text',
    }
  }

  // Convenient method
  async send (text: string, channel = 'log'): Promise<void> {
    await this.sendMsg({
      text,
      channel: '#' + channel,
    })
  }

  async sendMsg (_msg: SlackMessage): Promise<void> {
    const { webhookUrl } = this.cfg

    if (!webhookUrl) {
      console.log(_msg.text)
      return
    }

    const body = {
      ...this.defaults(),
      ..._msg,
    }

    this.decorateMsg(body)

    await got
      .post(webhookUrl, {
        json: true,
        body,
      })
      .catch(ignored => {}) // ignore, cause slack is weirdly returning non-json text "ok" response
  }

  // mutates
  protected decorateMsg (msg: SlackMessage): void {
    const tokens: string[] = []

    tokens.push(timeUtil.nowPretty())
    tokens.push(msg.text)

    msg.text = tokens.join('\n')
  }
}
