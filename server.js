require('dotenv').config()
const Hapi = require('hapi')
const Octokit = require('@octokit/rest')
const axios = require('axios')

const octokit = new Octokit()
octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
})

const server = new Hapi.Server({
  port: process.env.PORT
})

server.route([
  {
    method: 'GET',
    path: '/',
    async handler(r, h) {
      return { success: true }
    }
  },
  // {
  //   method: 'GET',
  //   path: '/components:markdown/{owner}/{repo}',
  //   async handler({ params: { owner, repo } }, h) {
  //     const ownerAndRepo = `${owner}/${repo}`
  //     const result = await octokit.search.code({
  //       q: ['components', 'in:path', 'language:md', `repo:${ownerAndRepo}`].join(' ')
  //     })
  //     return result
  //   }
  // },
  {
    method: 'GET',
    path: '/components/{owner}/{repo}',
    async handler({ params: { owner, repo } }, h) {
      const result = await octokit.repos.getContent({
        owner,
        repo,
        ref: 'master',
        path: 'components'
      })

      try {
        const itemContents = await Promise.all(
          result.data.map(async (item) => {
            if (item.type !== 'file') {
              return
            }

            const response = await axios.get(item.download_url, { responseType: 'text', transformResponse: data => data })
            return {
              name: item.name,
              size: item.size,
              content: response.data
            }
          })
        )
        return itemContents
      }
      catch (error) {
        console.error(error)
        throw error
      }
    }
  }
])

server.start()
