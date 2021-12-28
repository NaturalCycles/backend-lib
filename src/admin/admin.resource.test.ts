import { mockTime } from '@naturalcycles/dev-lib/dist/testing'
import { BaseAdminService, FirebaseSharedService, getDefaultRouter } from '../index'
import { expressTestService } from '../testing'

export const firebaseService = new FirebaseSharedService({
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  apiKey: 'FIREBASE_API_KEY',
  // serviceAccount: 'FIREBASE_SERVICE_ACCOUNT_PATH',
})

class AdminService extends BaseAdminService {
  override getEmailPermissions(email?: string): Set<string> | undefined {
    if (email === 'good@mail.com') {
      return new Set(['p1', 'p2'])
    } else if (email === 'second@mail.com') {
      return new Set(['s1', 's2'])
    }
  }
}

export const adminService = new AdminService(firebaseService.auth(), {
  // authEnabled: false,
})

const adminResource = getDefaultRouter()
adminResource.get('/admin/info', async (req, res) => {
  res.json((await adminService.getAdminInfo(req)) || null)
})
adminResource.post('/admin/login', adminService.getFirebaseAuthLoginHandler())

beforeEach(() => {
  mockTime()
})

const app = expressTestService.createAppFromResource(adminResource)
afterAll(async () => {
  await app.close()
})

describe('login', () => {
  test('should return 401 if no auth header', async () => {
    const { statusCode } = await app.post('admin/login', {
      throwHttpErrors: false,
    })
    expect(statusCode).toBe(401)
  })

  test('login should set cookie', async () => {
    const TOKEN = 'abcdef1'

    const { statusCode, headers } = await app.post('admin/login', {
      headers: {
        Authentication: TOKEN,
      },
    })
    expect(statusCode).toBe(204)

    const c = headers['set-cookie']?.[0]
    expect(c).toMatchInlineSnapshot(
      `"admin_token=abcdef1; Max-Age=2592000; Path=/; Expires=Sat, 21 Jul 2018 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"`,
    )
  })

  test('logout should clear cookie', async () => {
    const { statusCode, headers } = await app.post('admin/login', {
      headers: {
        Authentication: 'logout', // magic string
      },
    })
    expect(statusCode).toBe(204)

    const c = headers['set-cookie']?.[0]
    expect(c).toMatchInlineSnapshot(
      `"admin_token=logout; Max-Age=0; Path=/; Expires=Thu, 21 Jun 2018 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"`,
    )
  })
})

describe('getAdminInfo', () => {
  beforeEach(() => {
    jest.spyOn(adminService, 'getEmailByToken').mockImplementation(async (_, token) => {
      if (token === 'good') return 'good@mail.com'
      if (token === 'second') return 'second@mail.com'
    })
  })

  test('should return null if not admin', async () => {
    const r = await app.get('admin/info').json()
    expect(r).toMatchInlineSnapshot(`null`)
  })

  test('admin1 should see its permissions', async () => {
    const r = await app
      .get('admin/info', {
        headers: {
          'x-admin-token': 'good',
        },
      })
      .json()
    expect(r).toMatchInlineSnapshot(`
      Object {
        "email": "good@mail.com",
        "permissions": Array [
          "p1",
          "p2",
        ],
      }
    `)
  })

  test('second admin should see its permissions', async () => {
    const r = await app
      .get('admin/info', {
        headers: {
          'x-admin-token': 'second',
        },
      })
      .json()
    expect(r).toMatchInlineSnapshot(`
      Object {
        "email": "second@mail.com",
        "permissions": Array [
          "s1",
          "s2",
        ],
      }
    `)
  })
})
