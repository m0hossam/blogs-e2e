const loginWith = async (page, username, password) => {
    await page.getByLabel('Username').fill(username)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'Create New Blog' }).click()
    await page.getByLabel('Title').fill(title)
    await page.getByLabel('Author').fill(author)
    await page.getByLabel('URL').fill(url)
    await page.getByRole('button', { name: 'Create' }).click()
}

const blogs = [
    {
        title: 'Chronicles of the Wild West',
        author: 'Clint Eastwood',
        url: 'https://clinteastwood.com/chronicles',
        likes: 55
    },
    {
        title: 'ABC Murders',
        author: 'Agatha Christie',
        url: 'https://agathachristie.com/abc_murders',
        likes: 66
    },
    {
        title: 'Concurrency in Go',
        author: 'Patrick Peterson',
        url: 'https://go.dev/concurrency/intro',
        likes: 77
    },
    {
        title: 'Mission: Red Dawn',
        author: 'Comrade Dyatlov',
        url: 'https://redalert2.com/campaign/soviet/1',
        likes: 88
    },
]

export { loginWith, createBlog, blogs }