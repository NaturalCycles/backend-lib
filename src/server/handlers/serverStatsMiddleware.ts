import {
  _mb,
  _ms,
  _percentile,
  _sortBy,
  _stringMapEntries,
  _stringMapValues,
  _sum,
  StringMap,
} from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'
import { onFinished } from '../../index'

const { GAE_INSTANCE } = process.env

// Map from "endpoint" to latency
interface Stat {
  stack: SizeLimitedStack<number>
  '2xx': number
  '4xx': number
  '5xx': number
}

const serverStatsMap: StringMap<Stat> = {}

const percentiles = [50, 90, 99]
const families = ['2xx', '4xx', '5xx']

// Store this number of last latencies
const SIZE = 50
const MAX_ENDPOINTS = 30

/**
 * Depends on serverStatsMiddleware to work.
 *
 * @example
 *
 * router.get('/stats', serverStatsHTMLHandler)
 */
export const serverStatsHTMLHandler: RequestHandler = (req, res) => {
  const allLatencies = _stringMapValues(serverStatsMap).flatMap(s => s.stack.items)
  const all2xx = _sum(_stringMapValues(serverStatsMap).flatMap(s => s['2xx']))
  const all4xx = _sum(_stringMapValues(serverStatsMap).flatMap(s => s['4xx']))
  const all5xx = _sum(_stringMapValues(serverStatsMap).flatMap(s => s['5xx']))

  const uptime = _ms(process.uptime() * 1000)
  const rss = _mb(process.memoryUsage().rss)
  const inst = GAE_INSTANCE ? `, instance: ${GAE_INSTANCE.slice(GAE_INSTANCE.length - 3)}` : ''

  const html = [
    `<pre>uptime: ${uptime}, rss: ${rss} Mb${inst}</pre>`,
    '<table border="1" cellpadding="15">',
    `<tr>`,
    `<th><pre>endpoint</pre></th>`,
    ...families.map(f => `<th><pre>${f}</pre></th>`),
    ...percentiles.map(pc => `<th><pre>p${pc}</pre></th>`),
    `</tr>`,
    `<tr>`,
    `<td><pre>*</pre></td>`,
    `<td align="right"><pre>${all2xx}</pre></td>`,
    `<td align="right"><pre>${all4xx}</pre></td>`,
    `<td align="right"><pre>${all5xx}</pre></td>`,
    ...percentiles.map(
      pc => `<td align="right"><pre>${Math.round(_percentile(allLatencies, pc))}</pre></td>`,
    ),
    `</tr>`,
    ..._sortBy(
      _stringMapEntries(serverStatsMap),
      ([_, stat]) => stat['2xx'] + stat['4xx'] + stat['5xx'],
    )
      .reverse()
      .map(([endpoint, stat]) => {
        return [
          '<tr>',
          `<td><pre>${endpoint}</pre></td>`,
          ...families.map(f => `<td align="right"><pre>${stat[f]}</pre></td>`),
          ...percentiles.map(
            pc =>
              `<td align="right"><pre>${Math.round(_percentile(stat.stack.items, pc))}</pre></td>`,
          ),
          '</tr>',
        ].join('\n')
      }),
    '</table>',
  ].join('\n')

  res.send(html)
}

/**
 * Unlocks serverStatsHTMLHandler
 */
export function serverStatsMiddleware(): RequestHandler {
  let lastCleanup = Date.now()

  return function serverStatsHandler(req, res, next) {
    const started = Date.now()

    onFinished(res, () => {
      const now = Date.now()
      const latency = now - started

      let endpoint = [req.method, (req.route?.path || req.path).toLowerCase()].join(' ')
      if (endpoint.length > 1 && endpoint.endsWith('/'))
        endpoint = endpoint.slice(0, endpoint.length - 1)

      serverStatsMap[endpoint] ||= {
        stack: new SizeLimitedStack<number>(SIZE),
        '2xx': 0,
        '4xx': 0,
        '5xx': 0,
      }

      serverStatsMap[endpoint]!.stack.push(latency)
      if (res.statusCode) {
        serverStatsMap[endpoint]![getStatusFamily(res.statusCode)]++
      }

      if (now - lastCleanup > 60_000) {
        lastCleanup = now
        cleanupServerStats()
      }
    })

    next()
  }
}

function cleanupServerStats(): void {
  if (Object.keys(serverStatsMap).length <= MAX_ENDPOINTS) return

  const endpoint = _sortBy(
    _stringMapEntries(serverStatsMap),
    ([_, stat]) => stat['2xx'] + stat['4xx'] + stat['5xx'],
  )[0]?.[0]
  if (endpoint) {
    delete serverStatsMap[endpoint]
  }
}

function getStatusFamily(statusCode: number): '2xx' | '4xx' | '5xx' {
  if (statusCode < 400) return '2xx'
  if (statusCode < 500) return '4xx'
  return '5xx'
}

class SizeLimitedStack<T> {
  constructor(public size: number) {}

  index = 0
  items: T[] = []

  push(item: T): void {
    this.items[this.index] = item
    this.index = this.index === this.size ? 0 : this.index + 1
  }
}
