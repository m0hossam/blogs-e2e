const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith } = require('./helper')

const admin = {
  username: 'admin',
  password: 'admin',
  name: 'Mohamed Hossam'
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // Clear DB
    await request.post('api/users', { // Create a default admin user
      data: {
        username: admin.username,
        password: admin.password,
        name: admin.name
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Login to the app')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, admin.username, admin.password)
      await expect(page.getByText('blogs')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'foo', 'bar')
      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('blogs')).not.toBeVisible()
    })
  })
})
