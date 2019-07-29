import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { SlackSharedService } from '../..'

const { SLACK_WEBHOOK_URL } = requireEnvKeys('SLACK_WEBHOOK_URL')

const slackService = new SlackSharedService({
  webhookUrl: SLACK_WEBHOOK_URL,
  defaults: {
    channel: 'test',
  },
})

test('slack', async () => {
  await slackService.sendMsg({
    text: 'hello',
    attachments: [
      {
        pretext: 'Optional text that appears above the attachment block',
        color: '#2eb886', // green
        text: 'att text',
        // "title": "Slack API Documentation",
        // "title_link": "https://api.slack.com/",
        fields: [
          {
            title: 'Priority',
            value: 'High',
            short: true,
          },
          {
            title: 'Priority2',
            value: 'Low',
            short: true,
          },
          {
            title: 'Priority3',
            value: 'Med',
            short: true,
          },
          {
            title: 'Priority4 short',
            value: 'Med',
            short: true,
          },
        ],
        // "footer": "Slack API",
        // "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
        // "ts": 123456789,
      },
    ],
  })
})
