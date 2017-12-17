const request = require('request')
const params = process.argv.slice(2)

class Order2Markov {
    constructor(samples) {
        /*
            this.outcomes
            
            in the format of:
            {
                // nothing two words ago
                '': {
                    // something one word ago
                    'one': [
                        'next word',
                        // again for more probability
                        'next word',
                        'other next word',
                        // end of sample
                        ''
                    ]
                },
                // something two words ago
                'two': {
                    'one': [ ... ],
                    'other one': [ ... ]
                }
            }
        */
        this.outcomes = {}
        samples.forEach((sample) => {
            let words = sample.split(' ')
            
            for(var i = 0; i < words.length; i++) {
                let word = words[i]
                if(i === 0) {
                    if(!this.outcomes['']) {
                        this.outcomes[''] = {
                            '': [word]
                        }
                    } else {
                        this.outcomes[''][''].push(word)
                    }
                } else if(i === 1) {
                    let before = words[i - 1]
                    if(!this.outcomes[''][before]) {
                        this.outcomes[''][before] = [word]
                    } else {
                        this.outcomes[''][before].push(word)
                    }
                } else {
                    let before = words[i - 1]
                    let beforeBefore = words[i - 2]
                    
                    if(!this.outcomes[beforeBefore]) {
                        this.outcomes[beforeBefore] = {}
                    }
                    
                    if(!this.outcomes[beforeBefore][before]) {
                        this.outcomes[beforeBefore][before] = [word]
                    } else {
                        this.outcomes[beforeBefore][before].push(word)
                    }
                }
            }
            console.log(words[words.length-2], words[words.length-1])
            if(!this.outcomes[words[words.length-2]]) {
                this.outcomes[words[words.length-2]] = {}
                this.outcomes[words[words.length-2]][words[words.length-1]] = ['']
            } else {
                if(!this.outcomes[words[words.length-2]][words[words.length-1]]) {
                    this.outcomes[words[words.length-2]][words[words.length-1]] = ['']
                } else {
                    this.outcomes[words[words.length-2]][words[words.length-1]].push('')
                }
            }
        })
    }
    
    generate() {
        let chosenWords = []
        let currentWord = this.outcomes[''][''][Math.floor(Math.random()*this.outcomes[''][''].length)]
        let counter = 0
        
        while(currentWord) {
            chosenWords.push(currentWord)
            
            let before
            let beforeBefore
            
            counter++
            
            before = chosenWords[counter-1]
            
            if(counter === 1) {
                beforeBefore = ''
            } else {
                beforeBefore = chosenWords[counter-2]
            }
            
            let possibilities = this.outcomes[beforeBefore][before]
            currentWord = possibilities[Math.floor(Math.random()*possibilities.length)]
        }
        
        return chosenWords.join(' ')
    }
}

;(async () => {
    request('https://www.reddit.com/r/'+params[0]+'/top.json?limit=1000&t=all', function (error, response, body) {
        if(!error) {
            let json = JSON.parse(body)
            let items = json.data.children.map(item => item.data.title)
            let generator = new Order2Markov(items)
            console.log('Chain generated')
            for(var i = 0; i < 10; i++) {
                console.log(generator.generate())
            }
        }
    })
})()