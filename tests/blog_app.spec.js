const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

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

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, admin.username, admin.password)
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Chronicles of the Wild West', 'Clint Eastwood', 'https://clinteastwood.com/chronicles')
      await expect(page.getByText('New blog added')).toBeVisible()
      await expect(page.getByText('Chronicles of the Wild West - Clint Eastwood')).toBeVisible()
    })

    describe('and one blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Chronicles of the Wild West', 'Clint Eastwood', 'https://clinteastwood.com/chronicles')
      })

      test('blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'Show details' }).click()
        await expect(page.getByText('Likes: 0')).toBeVisible()
        await page.getByRole('button', { name: 'Like' }).click()
        await expect(page.getByText('Likes: 1')).toBeVisible()
      })

      test.only('blog can be deleted by its user', async ({ page }) => {
        await page.getByRole('button', { name: 'Show details' }).click()
        page.on('dialog', dialog => dialog.accept()) // Register a dialog handler to accept the delete confirmation dialog
        await page.getByRole('button', { name: 'Remove' }).click()
        await expect(page.getByText('Blog removed')).toBeVisible()
        await expect(page.getByText('Chronicles of the Wild West - Clint Eastwood')).not.toBeVisible()
      })
    })
  })
})
