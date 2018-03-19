const axios = require('axios')
const Boom = require('boom')

async function fetchBoard({
  boardID
}) {
  const url = `https://trello.com/b/${boardID}.json`
  const { data } = await axios.get(url)
    .catch(error => {
      throw Boom.boomify(error, { statusCode: error.response.status })
    })
  
  return data
}

module.exports = {
  fetchBoard
}