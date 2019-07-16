import { dayjs } from '@naturalcycles/time-lib'
import * as got from 'got'
import { SlackMessage, SlackSharedServiceCfg } from './slack.shared.service.model'

export class SlackSharedService {
  static INSTANCE_ALIAS = ['slackService']

  constructor (private slackServiceCfg: SlackSharedServiceCfg) {}

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
    const { webhookUrl } = this.slackServiceCfg

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

    tokens.push(dayjs().toPretty())
    tokens.push(msg.text)

    msg.text = tokens.join('\n')
  }
}
