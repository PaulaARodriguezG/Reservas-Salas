const express =require('express');
const http = require ('http');
const WebSocket = require ('ws');
const bodyParser = require ('body-parser');
const cors = require ('cors');
const {router: salasRouter,setBroadcastFunction}=require("./salas");
const {router: reservasRouter,setBroadcastFunction: setReservasBroadcast}=require("./reservas");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

app.use(cors());
app.use (bodyParser.json());
app.use(express.static('public'));
app.use('/salas', salasRouter);
app.use('/reservas', reservasRouter);

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/public/index.html')
});

wss.on('connection', (ws) => {
    console.log('Cliente conectado');
  
    ws.on('close', () => {
      console.log('Cliente desconectado');
    });
  });

setBroadcastFunction((data)=>{
    wss.clients.forEach((client) =>{
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });
});

setReservasBroadcast((data)=>{
    wss.clients.forEach((client) =>{
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });
});


const PORT = 3000;
server.listen(PORT,()=>{
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
});

app.use((req,res,next)=>{
    res.status(404).json({mensaje: ' Ruta no encontrada'});
})






