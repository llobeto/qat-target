const path = require('path')
const port = process.env.PORT || 8080
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const people = {}

let concurrency = 0

function operation(op) {
  concurrency++
  console.log('Concurrencia ' + concurrency)
  const timeout = Math.trunc(Math.random() * 200) + concurrency
  console.log('Esperando ' + timeout + ' milisegundos')
  setTimeout(() => {
    op()
    concurrency--
    console.log('Concurrencia ' + concurrency)
  }, timeout)
}

app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(bodyParser.json())
const cookieParser = require("cookie-parser")
app.use(cookieParser())

app.get('/personas/:id', function (req, res) {
  operation(() => {
    const id = req.params.id
    if (id in people) res.json(people[id])
    else {
      res.status = 404
      res.json({ error: 'No existe una persona con el id ' + id})
    }
  })
})


app.get('/personas/:id', function (req, res) {
  operation(() => {
    const id = req.params.id
    if (id in people) delete people[id]
    else {
      res.status = 404
      res.json({ error: 'No existe una persona con el id ' + id})
      console.error('No existe una persona con el id ' + id)
    }
  })
})

app.get('/personas', function (req, res) {
  operation(() => {
    res.json(Object.values(people));
  })
})

app.get('/home', function (req, res) {
  let session = req.cookies.session
  if (!session) {
    res.status(401).send('<html><body><h1>Error! No ha iniciado sesión</h1></html>')
    return
  }
  if ((new Date()).getTime() - Number.parseInt(session, 10) > 5000) {
    res.status(401).send('<html><body><h1>Error! Sesión expirada</h1></html>')
    return
  }
  res.status(401).sendFile(path.join( __dirname, '../public/--home.html'))
})

app.post('/personas', function (req, res) {
  operation(() => {
    const person = req.body
    if (!person) {
      res.status = 400
      res.json({ error: 'No me diste una persona'})
      console.error('No existe una persona con el id ' + id)
      return
    }
    try {
      res.status(201).json(addPerson(person))
    } catch(e) {
      res.status = 400
      res.json({ error: e.message})
      return
    }
  })
});

app.post('/login', function (req, res) {
  const credentials = req.body
  if (!credentials) {
    res.status(401).json({ error: 'Credenciales inválidas'})
    return
  }
  if (credentials.user != 'tester') {
    res.status(401).json({ error: 'Credenciales inválidas'})
    return
  }
  if (credentials.password != 'testing') {
    res.status(401).json({ error: 'Credenciales inválidas'})
    return
  }
  res.status(201).json({
    url: '/home',
    session: (new Date()).getTime()
  })
});

app.listen(port, function () {
  console.log('Listening on port ' + port);
});

function checkPerson(person) {
// Error voluntario. nombre = '' aceptado.
  if (!person.nombre && person.nombre != '') throw Error('Debe especificarse un nombre');
  if (!person.apellido) throw Error('Debe especificarse un apellido');
}

function addPerson(person) {
  // Error voluntario. solo 1000 elementos como máximo
  if (Object.values(people).length <= 1000) {
    checkPerson(person)
    if (person.id) throw Error('El id lo ponemos nosotros!');
    person.id = Math.trunc(Math.random() * 1000000)
    people[person.id] = person
    console.log(`Hay ${Object.values(people).length} personas.`)
  }
  return person
}

function init() {
  addPerson({
    nombre: 'Juan Pablo',
    apellido: 'Spinelli',
    dni: 20978454
  })
  addPerson({
    nombre: 'Marta',
    apellido: 'Batman',
    fechaDeNaciemto: '25/11/1940'
  })
  addPerson({
    nombre: 'María Martina',
    apellido: 'Rodríguez',
    dni: 34543778,
    cuil: '20-34543778-7'
  })
  addPerson({
    nombre: 'Antonio',
    apellido: 'Blaquier',
    fechaDeNaciemto: '05/09/1963'
  })
}

init();