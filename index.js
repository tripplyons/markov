const request = require('request')
const params = process.argv.slice(2)

;(async () => {
    request('https://www.reddit.com/r/'+params[0]+'/top.json?limit=200&t=all', function (error, response, body) {
        if(!error) {
            let json = JSON.parse(body)
            let items = json.data.children.map(item => item.data.title)
            console.log(items)
        }
    })
})()