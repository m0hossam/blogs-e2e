const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, blogs } = require('./helper')

const admin = {
  username: 'admin',
  password: 'admin',
  name: 'Mohamed Hossam'
}

const otherUser = {
  username: 'bond007',
  password: 'bond007',
  name: 'James Bond'
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Clear DB
    await request.post('/api/testing/reset')
    // Create a default admin user
    await request.post('api/users', {
      data: {
        username: admin.username,
        password: admin.password,
        name: admin.name
      }
    })
    // Create another user for testing
    await request.post('api/users', {
      data: {
        username: otherUser.username,
        password: otherUser.password,
        name: otherUser.name
      }
    })
    // Launch web app
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
      await page.getByRole('button', { name: 'Create New Blog' }).click()
      await createBlog(page, blogs[0].title, blogs[0].author, blogs[0].url)
      await expect(page.getByText('New blog added')).toBeVisible()
      await expect(page.getByText(`${blogs[0].title} - ${blogs[0].author}`)).toBeVisible()
    })

    describe('and one blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'Create New Blog' }).click()
        await createBlog(page, blogs[0].title, blogs[0].author, blogs[0].url)
      })

      test('blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'Show details' }).click()
        await expect(page.getByText('Likes: 0')).toBeVisible()
        await page.getByRole('button', { name: 'Like' }).click()
        await expect(page.getByText('Likes: 1')).toBeVisible()
      })

      test('blog can be deleted by its user', async ({ page }) => {
        await page.getByRole('button', { name: 'Show details' }).click()
        page.on('dialog', dialog => dialog.accept()) // Register a dialog handler to accept the delete confirmation dialog
        await page.getByRole('button', { name: 'Remove' }).click()
        await expect(page.getByText('Blog removed')).toBeVisible()
        await expect(page.getByText(`${blogs[0].title} - ${blogs[0].author}`)).not.toBeVisible()
      })

      test('only the user who added the blog sees its delete button', async ({ page }) => {
        // admin can see the blog since he's the creator
        await page.getByRole('button', { name: 'Show details' }).click()
        await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible()

        // admin logs out, other user logs in
        await page.getByRole('button', { name: 'Logout' }).click()
        await loginWith(page, otherUser.username, otherUser.password)

        // other use CANNOT see the blog since he's NOT the creator
        await page.getByRole('button', { name: 'Show details' }).click()
        await expect(page.getByRole('button', { name: 'Remove' })).not.toBeVisible()
      })
    })

    describe('and multiple blogs w/likes exist', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'Create New Blog' }).click()
        for (const blog of blogs) {
          // Code could be shorter by storing locators in consts but I'm afraid of stale nodes and flaky behavior
          await createBlog(page, blog.title, blog.author, blog.url)
          await page.getByText(blog.title).getByRole('button', { name: 'Show Details' }).click()
          for (let i = 0; i < blog.likes; i++) {
            await page.getByText(blog.title).locator('..').getByRole('button', { name: 'Like' }).click()
            // Ensure UI updates before the final assertion
            await expect(page.getByText(blog.title).locator('..').getByText(`Likes: ${i + 1}`)).toBeVisible()
          }
          await expect(page.getByText(blog.title).locator('..').getByText(`Likes: ${blog.likes}`)).toBeVisible()
        }
      })

      test('the blogs are sorted according to their likes in descending order', async ({ page }) => {
        const sortedBlogs = blogs.map(b => ({ ...b }))
        sortedBlogs.sort((a, b) => b.likes - a.likes);
        const blogElements = page.locator('.blog-list .blog')
        const headers = await blogElements.evaluateAll(elements =>
          elements.map(e => {
            const firstTextNode = e.firstChild?.textContent || ''
            return firstTextNode.trim()
          })
        )
        const expectedOrder = sortedBlogs.map(b => `${b.title} - ${b.author} Hide details`)
        expect(headers).toEqual(expectedOrder)
      })
    })
  })
})
