import axios from 'axios'
const API_URL = import.meta.env.VITE_TODOS_URL || '/api/assets/todos'

// Haetaan todot rajapinnasta
const getAll = () => {
  const request = axios.get(API_URL)
  return request.then(response => response.data)
}

const create = (newObject) => {
  console.log('create kutsuttu parametrilla:', newObject)
  //const config = {
  //  headers: { Authorization: token }
  //}
  //console.log('Pyynnön konfiguraatio:', config)
  const request = axios.post(API_URL, newObject)
  return request.then(response => response.data)
}

export default { getAll,create }