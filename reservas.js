const express=require('express');
const router = express.Router();


let reservas = []

let broadcast;

function setBroadcastFunction(fn){
    broadcast=fn;
}

//--------GET-------
router.get('/', (req,res)=>{
    res.json(reservas);
});

//-------POST------

router.post('/',(req,res)=>{
    const {id, salaid,nombre,inicio,fin} = req.body;

    if (!id || !salaid || !nombre || !inicio || !fin){
        return res.status(400).json({mensaje:'Todos los campos son obligatorios'});
    }

    const idDuplicado=reservas.some((r)=> r.id === id);
    if(idDuplicado){
        return res.status(400).json({mensaje:'el ID ya esta en uso'});
    }
    
    const solapa= reservas.some((r)=> r.salaid == salaid && new Date(r.inicio) < new Date(fin) && new Date(inicio)< new Date(r.fin));

    if (solapa){
        return res.status(400).json({mensaje: 'La sala ya esta reservada en este horario'});
    }

    const nuevaReserva ={ id,salaid,nombre,inicio,fin};
    reservas.push(nuevaReserva);

    if (broadcast){
        broadcast({action: 'add', nuevaReserva});
    }
    res.status(201).json({mensaje:'Reserva creada con exito', reserva: nuevaReserva});
});

//-------PUT------
router.put('/:id', (req,res)=>{
    const id= parseInt(req.params.id);
    const index = reservas.findIndex((r) => r.id === id);

    if (index === -1){
        return res.status(404).json({mensaje: 'Reserva no encontrada'});
    }

    reservas[index]={...reservas[index], ...req.body};

    if(broadcast){
        broadcast({action: 'update', reserva: reservas[index]});
    }
    res.json(reservas[index]);
});

//------DELETE----
router.delete('/:id', (req,res) =>{
    const id = parseInt(req.params.id);
    const index = reservas.findIndex((r) => r.id === id);

    if(index === -1){
        return res.status(404).json({mensaje: 'Reserva no encontrada'});
    }

    const reservaEliminada = reservas.splice(index, 1)[0];

    if(broadcast){
        broadcast({action: 'delete', reserva: reservaEliminada});
    }
    res.json(reservaEliminada);
});

module.exports={router,setBroadcastFunction};
