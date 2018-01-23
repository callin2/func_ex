const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
const ag = require('agensgraph');


const cors =  corsMiddleware({
    origins: ['*']
});

const dbclient = new ag.Client({
    host: '27.117.163.21',
    port: '5559',
    user: 'v_ba',
    password: 'blockchain!',
    database: 'v_ba',
    graph_path: 'v_ba'
});

dbclient.connect()

var server = restify.createServer({
    name: 'agens'
});

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser());


server.post('/api/v1/query', (req,res,next) => {
    console.log(req.body);

    dbclient.query(req.body.query,[],(err,result)=>{
        if(err){
            res.status(500)
            res.json({error: err})
            return
        }
        res.json(result);
    });

    next();
});

server.listen(8888, function() {
    console.log('%s listening at %s', server.name, server.url);
});