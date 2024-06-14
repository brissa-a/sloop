import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { cat as catLoggingNEvent } from './misc/loggingNEvent';
import { catScheduler, startScheduler } from './misc/scheduler';
import { createContext, createWsContext } from './misc/trpc';
import { appRouter as trpcRouter, appWsRouter as trpcWsRouter } from './trpc';


export const app = express();
app.use(express.json())
app.use(cookieParser());


const port = 3000;

//curl http://localhost:3000/
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/cat/loggingNEvent', (req, res) => {
    res.json(catLoggingNEvent())
})

app.get('/cat/scheduler', (req, res) => {
    res.json(catScheduler())
})

const allowedOrigins = ['localhost', 'https://sloop.partipirate.org', 'https://sloopol2h4rnr-sloop-vite-dev.functions.fnc.fr-par.scw.cloud']


app.use((req, res, next) => {

    if (
        !req.headers.origin ||
        (!allowedOrigins.includes(req.headers.origin) && !req.headers.origin.startsWith('http://localhost'))
    ) {
        console.warn('from', req.headers.origin, 'CORS denied', req.headers.origin?.startsWith('http://localhost'))
        return next();
    }

    //console.log('from', req.headers.origin, 'CORS allowed')

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Set-Authorization-Bearer, Content-Type, X-Requested-With, accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Authorization-Bearer');
    next();
})

app.disable('x-powered-by')

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.options('*', (req, res, next) => {
    res.status(200).send('OK');
})

app.use(
    '/trpc',
    createExpressMiddleware({
        router: trpcRouter,
        createContext,
    }),
);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const handler = applyWSSHandler({ wss, router: trpcWsRouter, createContext: createWsContext });

wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once('close', () => {
        console.log(`➖➖ Connection (${wss.clients.size})`);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
});


server.listen(port, () => {
    console.log(`App listening at:`);
    console.log(`✅  http://localhost:${port}`)
    console.log(`✅  ws://localhost:${port}`)
});

startScheduler()