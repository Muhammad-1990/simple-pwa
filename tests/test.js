function render (template, options) {
    return template.replace(/\{\{\s?([\w.]+)\s?\}\}/g, (match, variable) => {
      return variable.split('.').reduce((previous, current) => {
        return previous[current]
      }, options) || ''
    })
  }
  
  describe('#render', () => {
    const template = '<h1>{{ the_title }}</h1><h2>{{ the_subtitle }}</h2>'
    
    const nested_template = `
      <li data-id="{{ id }}">
        <img src="{{ photos.primary.url }}" alt="{{ photos.primary.description }}">
        <p>
          <strong>{{ name.first }} {{ name.last }}</strong>
          <small>{{ role }}</small>
        </p>
      </li>
  `
    
    const data = {
      the_title: 'hello, world!',
      the_subtitle: 'an experiment in javascript'
    }
    const expected = '<h1>hello, world!</h1><h2>an experiment in javascript</h2>'
    const empty_expected = '<h1></h1><h2></h2>'
    
    it('interpolates data into the template', () => {
      expect(render(template, data).indexOf(data.the_title)).toBe(4)
    })
    
    it('interpolates multiple strings into the template', () => {
      expect(render(template, data)).toBe(expected)
    })
    
    it('interpolates nothing if the property is not in the options hash', () => {
      expect(render(template, {})).toBe(empty_expected)
    })
    
    it('interpolates nested property names as well as flat data', () => {
      const myEmployee = {
        id: 'asdfsafdasdfasdfa',
        name: {
          first: 'Bob',
          last: 'Builder'
        },
        role: 'Lead Engineer',
        photos: {
          primary: {
            url: 'foobar.com/img.jpg',
            description: 'A photo of Bob the Builder'
          }
        }
      }
      
      expect(render(nested_template, myEmployee)).toContain('data-id="asdfsafdasdfasdfa"')
      expect(render(nested_template, myEmployee)).toContain('alt="A photo of Bob the Builder"')
      expect(render(nested_template, myEmployee)).toContain('src="foobar.com/img.jpg"')
      expect(render(nested_template, myEmployee)).toContain('<strong>Bob Builder</strong>')
      expect(render(nested_template, myEmployee)).toContain('<small>Lead Engineer</small>')
    })
  })