const API_URL= 'http://localhost:3000/salas';
const API_URL2= 'http://localhost:3000/reservas';
const WS_URL = 'ws://localhost:3000';

let editingSalaId=null;
let editingReservaId=null;
let socket;

function initWebSocket(){
    socket = new WebSocket(WS_URL);

    socket.addEventListener('open',()=>{
        console.log('conectado al servidor WebSocket');
    });

    socket.addEventListener('message', (event)=>{
        const message=JSON.parse(event.data);

        switch(message.action){
            case 'add':
                if (message.sala)addSalaToTable(message.sala);
                if (message.reserva)addReservaToTable(message.reserva);
                break;
            case 'update':
              if (message.sala)updateSalaInTable(message.sala);
              if (message.reserva)updateReservaInTable(message.reserva);
                break;
            case 'delete':
              if (message.sala)removeSalaFromTable(message.sala.id);
                if (message.reserva)removeReservaFromTable(message.reserva);
                break;
        }
    });

    socket.addEventListener('close', () => {
        console.log('desconectado del servidor webSocket. Intentando reconectar...');
        setTimeout(initWebSocket,5000);
    });
}

//-------salas-----

async function loadSalas() {
    try {
      const response = await fetch(API_URL);
      const salas = await response.json();
  
      const salaList = document.getElementById('sala-list');
      salaList.innerHTML = ''; 
  
      salas.forEach(addSalaToTable); 
    } catch (error) {
      alert('Error al cargar sala: ' + error.message);
    }
  }

  function addSalaToTable(sala) {
    const salaList = document.getElementById('sala-list');
    const row = document.createElement('tr');
  
    row.setAttribute('data-id', sala.id); 
    row.innerHTML = `
      <td>${sala.id}</td>
      <td>${sala.nombre}</td>
      <td>${sala.capacidad}</td>
      <td>${sala.estado}</td>
      <td>
        <button onclick="editSala(${sala.id})">Editar</button>
        <button onclick="deleteSala(${sala.id})">Eliminar</button>
      </td>
    `;
  
    salaList.appendChild(row);
  } 

  function updateSalaInTable(sala) {
    const row = document.querySelector(`tr[data-id="${sala.id}"]`);
    if (row) {
      row.children[1].textContent = sala.nombre;
      row.children[2].textContent = sala.capacidad;
      row.children[3].textContent = sala.estado;
    }
  }

  function removeSalaFromTable(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.remove();
    }
  }

  async function saveSala(event) {
    event.preventDefault(); 
  
    const id = document.getElementById('sala-id').value;
    const nombre = document.getElementById('sala-name').value;
    const capacidad = document.getElementById('sala-capacidad').value;
    const estado = document.getElementById('sala-estado').value;
  
    if (!id || !nombre || !capacidad || !estado) {
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    const sala = { id: parseInt(id), nombre, capacidad, estado };
  
    try {
      if (editingSalaId) {
        const response = await fetch(`${API_URL}/${editingSalaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sala),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.mensaje);
        }
  
        alert('Sala actualizada correctamente');
        editingSalaId = null; 
      } else {
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sala),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.mensaje);
        }
  
        alert('Sala guardada correctamente');
      }
  
      document.getElementById('sala-form').reset();
    } catch (error) {
      alert('Error al guardar la sala: ' + error.message);
    }
  }

  function editSala(id) {
    const sala = Array.from(document.querySelectorAll('#sala-list tr')).find(
      (row) => parseInt(row.children[0].textContent) === id
    );
  
    if (sala) {
      document.getElementById('sala-id').value = sala.children[0].textContent;
      document.getElementById('sala-name').value = sala.children[1].textContent;
      document.getElementById('sala-capacidad').value = sala.children[2].textContent;
      document.getElementById('sala-estado').value = sala.children[3].textContent;
  
      editingSalaId = id; 
    }
  }


  async function deleteSala(id) {
    if (!confirm('¿Estás seguro de eliminar esta sala?')) return;
  
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje);
      }
  
      alert('Sala eliminada correctamente');
    } catch (error) {
      alert('Error al eliminar la sala: ' + error.message);
    }
  }

  document.getElementById('sala-form').addEventListener('submit', saveSala);

//-------reservas-----

async function loadReservas() {
    try {
      const response = await fetch(API_URL2);
      const reservas = await response.json();
  
      const reservaList = document.getElementById('reserva-list');
      reservaList.innerHTML = ''; 
  
      reservas.forEach(addReservaToTable); 
    } catch (error) {
      alert('Error al cargar la reserva: ' + error.message);
    }
  }

  function addReservaToTable(reserva) {
    const reservaList = document.getElementById('reserva-list');
    const row = document.createElement('tr');
  
    row.setAttribute('data-id', reserva.id); 
    row.innerHTML = `
      <td>${reserva.id}</td>
      <td>${reserva.salaid}</td>
      <td>${reserva.nombre}</td>
      <td>${reserva.inicio}</td>
      <td>${reserva.fin}</td>
      <td>
        <button onclick="editReserva(${reserva.id})">Editar</button>
        <button onclick="deleteReserva(${reserva.id})">Eliminar</button>
      </td>
    `;
  
    reservaList.appendChild(row);
  } 

  function updateReservaInTable(reserva) {
    const row = document.querySelector(`tr[data-id="${reserva.id}"]`);
    if (row) {
      row.children[1].textContent = reserva.salaid;
      row.children[2].textContent = reserva.nombre;
      row.children[3].textContent = reserva.inicio;
      row.children[4].textContent = reserva.fin;
    }
  }

  function removeReservaFromTable(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.remove();
    }
  }

  async function saveReserva(event) {
    event.preventDefault(); 
  
    const id = document.getElementById('reserva-id').value;
    const salaid = document.getElementById('reserva-sala-id').value;
    const nombre = document.getElementById('reserva-name').value;
    const inicio = document.getElementById('reserva-inicio').value;
    const fin = document.getElementById('reserva-fin').value;
  
    if (!id || !salaid ||!nombre || !inicio || !fin) {
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    const reserva = { id: parseInt(id),salaid:parseInt(salaid), nombre, inicio, fin };
  
    try {
      if (editingReservaId) {
        const response = await fetch(`${API_URL2}/${editingReservaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reserva),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.mensaje);
        }
  
        alert('Reserva actualizada correctamente');
        editingReservaId = null; 
      } else {
        
        const response = await fetch(API_URL2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reserva),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.mensaje);
        }
  
        alert('Reserva guardada correctamente');
      }
  
      document.getElementById('reserva-form').reset();
    } catch (error) {
      alert('Error al guardar la reserva: ' + error.message);
    }
  }

  function editReserva(id) {
    const reserva = Array.from(document.querySelectorAll('#reserva-list tr')).find(
      (row) => parseInt(row.children[0].textContent) === id
    );
  
    if (reserva) {
      document.getElementById('reserva-id').value = reserva.children[0].textContent;
      document.getElementById('reserva-sala-id').value = reserva.children[1].textContent;
      document.getElementById('reserva-name').value = reserva.children[2].textContent;
      document.getElementById('reserva-inicio').value = reserva.children[3].textContent;
      document.getElementById('reserva-fin').value = reserva.children[4].textContent;
  
      editingReservaId = id; 
    }
  }


  async function deleteReserva(id) {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
  
    try {
      const response = await fetch(`${API_URL2}/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje);
      }
  
      alert('Reserva eliminada correctamente');
    } catch (error) {
      alert('Error al eliminar la reserva: ' + error.message);
    }
  }

  document.getElementById('reserva-form').addEventListener('submit', saveReserva);

initWebSocket();
loadSalas();
loadReservas();

  

