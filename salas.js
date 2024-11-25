const express = require ('express');
const router = express.Router();

let salas = [];

let broadcast;
function setBroadcastFunction(fn){
    broadcast=fn;
}

//--------GET-------
router.get('/', (req,res)=>{
    res.json(salas)
});

//-------POST------

router.post('/', (req,res)=>{
    const sala = req.body;

    if (!sala.id || !sala.nombre || !sala.capacidad || !sala.estado){
        return res.status(400).json({mensaje: 'Todos los campos son obligatorios'});
    }

    salas.push(sala);

    if (broadcast){
        broadcast({action:'add',sala});
    }
    res.status(201).json(sala);
});

//-------PUT------
router.put('/:id', (req,res)=>{
    const id= parseInt(req.params.id);
    const index = salas.findIndex((s) => s.id === id);

    if (index === -1){
        return res.status(404).json({mensaje: 'Sala no encontrada'});
    }

    salas[index]= {...salas[index],...req.body};
    if(broadcast){
        broadcast({action: 'update', sala: salas[index]});
    }
    res.json(salas[index]);
});

//------DELETE----
router.delete('/:id', (req,res) =>{
    const id = parseInt(req.params.id);
    const index = salas.findIndex((s) => s.id === id);

    if(index === -1){
        return res.status(404).json({mensaje: 'Sala no encontrada'});
    }

    const salaEliminada = salas.splice(index, 1)[0];

    if (broadcast){
        broadcast({action: 'delete', sala: salaEliminada});
    }
    
    res.json(salaEliminada);
});


module.exports ={router,setBroadcastFunction};


