const loginWith = async (page, username, password) => {
    await page.getByLabel('Username').fill(username)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, title, author, url) => {
    await page.getByLabel('Title').fill(title)
    await page.getByLabel('Author').fill(author)
    await page.getByLabel('URL').fill(url)
    await page.getByRole('button', { name: 'Create' }).click()
    await page.getByText(title).waitFor() // must wait for each blog to render
}

const blogs = [
    {
        title: 'Chronicles of the Wild West',
        author: 'Clint Eastwood',
        url: 'https://clinteastwood.com/chronicles',
        likes: 1
    },
    {
        title: 'ABC Murders',
        author: 'Agatha Christie',
        url: 'https://agathachristie.com/abc_murders',
        likes: 2
    },
    {
        title: 'Concurrency in Go',
        author: 'Patrick Peterson',
        url: 'https://go.dev/concurrency/intro',
        likes: 3
    },
    {
        title: 'Mission: Red Dawn',
        author: 'Comrade Dyatlov',
        url: 'https://redalert2.com/campaign/soviet/1',
        likes: 4
    },
]

export { loginWith, createBlog, blogs }