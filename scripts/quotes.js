class BoundNode {
    constructor(node, templatex) {
        this.template = templatex
        this.node = node
    }

    update(data) {
        let temp_template = this.template.slice(0)
        this.node.innerHTML = temp_template.replace(/\{\{\s?(\w+)\s?\}\}/g, (match, variable) => {
            return data[variable] || ''
        })
    }
}

class BoundModel {
    constructor(handlers) {
        const callbacks = []
        const data = {
            add_callback: function add_callback(fn) {
                callbacks.push(fn)
            }
        }

        const proxy = new Proxy(data, {
            set: function (target, property, value) {
                target[property] = value
                callbacks.forEach((callback) => callback())
                return true
            }
        })

        return proxy
    }
}




const quotes = [
    "What is the point of owning a race car if you can't drive it?",
    "Give me a scotch, I'm starving.",
    "I'm a huge fan of the way you lose control and turn into an enourmous green rage monster.",
    "I already told you, I don't want to join your super secret boy band.",
    "You know, it's times like these when I realize what a superhero I am."
]

const my_node = new BoundNode(document.querySelector('.js-bound-quote'),"My favorite {{ movie }} quote is <b>'{{ quote }}'</b>.")
const my_model = new BoundModel()

my_model.add_callback(function () {
    my_node.update(my_model)
})

my_model.movie = 'Iron Man 2'
window.setInterval(function () {
    my_model.quote = quotes[Math.floor(Math.random() * quotes.length)]
}, 1000)