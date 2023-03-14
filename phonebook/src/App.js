import { useState, useEffect } from 'react';
import axios from 'axios';

// axios
//   .get('http://localhost:3001/persons')
//   .then(response => {
//     const persons = response.data
//     console.log(persons)
//   })
const Filter = ({ value, onChange }) => {
  return (
    <div>
      filter shown with <input value={value} onChange={onChange} />
    </div>
  )
}

const PersonForm = ({ onSubmit, nameValue, nameOnChange, numberValue, numberOnChange }) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={nameValue} onChange={nameOnChange} />
      </div>
      <div>
        number: <input value={numberValue} onChange={numberOnChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, handleDelete }) => {
  return (
    <div>
      {persons.map(person =>
        <div key={person.id}>
          {person.name} {person.number}
          <button onClick={() => handleDelete(person.id)}>delete</button>
        </div>
      )}
    </div>
  )
}


const Notification = ({ message }) => {
  const notificationStyle = {
    border: '2px solid green',
    borderRadius: '5px',
    backgroundColor: 'lightGreen',
    padding: '10px',
    marginBottom: '10px',
  }
  if (message === null) {
    return null
  }
  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const Notification2 = ({ message2 }) => {
  const errnotificationStyle = {
    border: '2px solid red',
    borderRadius: '5px',
    backgroundColor: 'pink',
    padding: '10px',
    marginBottom: '10px',
  }
  if (message2 === null) {
    return null
  }
  return (
    <div style={errnotificationStyle}>
      {message2}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationMessage2, setNotificationMessage2] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/persons').then((response) => {
      setPersons(response.data);
    });
  }, []);

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber,
    }
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
        axios
          .put(`http://localhost:3001/persons/${existingPerson.id}`, personObject)
          .then(response => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : response.data))
            setNotificationMessage(`Updated ${newName}`)
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000)
          })
          .catch(error => {
            setNotificationMessage2(`Information of ${newName} has already been removed from server`)
            setTimeout(() => {
              setNotificationMessage2(null)
            }, 5000)
            setPersons(persons.filter(person => person.id !== existingPerson.id))
          })
      }
    } else {
      axios
        .post('http://localhost:3001/persons', personObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setNotificationMessage(`Added ${newName}`)
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000)
        })
    }
    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (id) => {
    const personToDelete = persons.find(person => person.id === id)
    if (window.confirm(`Are you sure you want to delete ${personToDelete.name}?`)) {
      axios
        .delete(`http://localhost:3001/persons/${id}`)
        .then(response => {
          setPersons(persons.filter(person => person.id !== id))
        })
        .catch(error => {
          setNotificationMessage2(`Information of ${personToDelete.name} has already been removed from server`)
          setTimeout(() => {
            setNotificationMessage2(null)
          }, 5000)
          setPersons(persons.filter(person => person.id !== id))
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <Notification2 message2={notificationMessage2} />
      <Filter value={filter} onChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        nameValue={newName}
        nameOnChange={handleNameChange}
        numberValue={newNumber}
        numberOnChange={handleNumberChange}
      />
      <h3>Numbers</h3> 
      <Persons persons={filteredPersons} handleDelete={deletePerson} />
    </div>
  )
}

export default App
