import { Admin401ErrorData, HttpError, memoFn } from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import * as ejs from 'ejs'
import { RequestHandler } from 'express'
import * as fs from 'fs'
import { BaseAdminService } from './base.admin.service'
import { FirebaseSharedServiceCfg } from './firebase.shared.service'

const log = Debug('nc:backend-lib:admin')

export interface ReqAdminCfg {
  /**
   * @default '/login.html'
   */
  loginHtmlPath?: string

  urlStartsWith?: string
}

export type AdminMiddleware = (reqPermissions?: string[], cfg?: ReqAdminCfg) => RequestHandler

export function createAdminMiddleware (adminService: BaseAdminService): AdminMiddleware {
  return (reqPermissions, cfg) => reqAdminPermissions(adminService, reqPermissions, cfg)
}

/**
 * Require Admin permission.
 * If not authenticated - will redirect to `loginHtmlPath` (default to /login.html).
 * If authenticated, but not authorized - will throw 403.
 * Otherwise will just pass.
 */
function reqAdminPermissions (
  adminService: BaseAdminService,
  reqPermissions: string[] = [],
  cfg: ReqAdminCfg = {},
): RequestHandler {
  const { loginHtmlPath = '/login.html', urlStartsWith } = cfg

  return async (req, res, next) => {
    if (urlStartsWith && !req.url.startsWith(urlStartsWith)) return next()

    try {
      await adminService.reqPermissions(req, reqPermissions)
      return next()
    } catch (err) {
      if (err instanceof HttpError && (err.data as Admin401ErrorData).adminAuthRequired) {
        // Redirect to login.html
        const href = `${loginHtmlPath}?autoLogin=1&returnUrl=\${location.href}`
        res.status(401).send(getLoginHtmlRedirect(href))
      } else {
        return next(err)
      }
    }
  }
}

interface LoginHtmlCfg {
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseAuthProvider: string
}

export function loginHtml (firebaseServiceCfg: FirebaseSharedServiceCfg): RequestHandler {
  const {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    adminAuthProvider: firebaseAuthProvider = 'GoogleAuthProvider',
  } = firebaseServiceCfg

  return (req, res) => {
    res.send(
      getLoginHtml({
        firebaseApiKey,
        firebaseAuthDomain,
        firebaseAuthProvider,
      }),
    )
  }
}

const getLoginHtml = memoFn((cfg: LoginHtmlCfg) => {
  log(`reading login.html`)
  const tmpl = fs.readFileSync(`${__dirname}/login.html`, 'utf8')
  return ejs.render(tmpl, cfg)
})

export function getLoginHtmlRedirect (href: string): string {
  return `
<html>
<body>
<script>
  document.write(\`401 Admin Authentication Required: <a href="${href}" id="loginLink">Login</a>\`)
  document.getElementById('loginLink').click()
</script>
</body>
</html>
`
}
