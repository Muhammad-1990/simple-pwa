// wrap things in an IIFE to keep them neatly isolated from other code.
(() => {
    // strict mode to prevent errors and enable some ES6 features
    'use strict'
    
    const employee_template = `
    <li data-id="{{ id.value }}">
      <img src="{{ picture.thumbnail }}" alt="{{ name.last }}" onclick="javascript:console.log('you clicked an img')">
      <p>
        <strong>{{ name.first }} {{ name.last }}</strong>
        <small>{{ name.title }}</small>
      </p>
    </li>
`

    function render(template, options) {
        return template.replace(/\{\{\s?([\w.]+)\s?\}\}/g, (match, variable) => {
            return variable.split('.').reduce((previous, current) => {
                return previous[current]
            }, options) || ''
        })
    }

    // create a new XMLHttpRequest. This is how we do AJAX without frameworks.
    const xhr = new XMLHttpRequest()
    // tell it which HTTP method to use and where to request
    xhr.open('GET', 'https://randomuser.me/api/?results=3')
    xhr.send(null)

    // we need to wait for the 'readystatechange' event to fire on the xhr object
    xhr.onreadystatechange = function () {
        // if the xhr has not finished we're not ready yet so just return
        if (xhr.readyState !== 4) { return }
        // if it didn't get a 200 status back log the error
        if (xhr.status !== 200) { return console.log('Error: ' + xhr.status) }
        // everything went well! use the response
        var employee_data = JSON.parse(xhr.responseText)
        let employees_markup = ''
        employee_data.results.forEach((an_employee) => {
            employees_markup += render(employee_template, an_employee)
        })
        const employee_list = document.querySelector('.js-employee-list')
        employee_list.innerHTML = employees_markup

        console.log(employee_data)
    }
    
})()