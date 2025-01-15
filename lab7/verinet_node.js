let express = require('express');
const Blockchain = require("./blockchain");
const uuid = require( 'uuid' );
const nodeAddress = uuid.v1().split('-').join(' ');
const dacoin = new Blockchain();
const port = process.argv[2];
// console.log( process.argv );

// assign an instance or object of express to our app
let app = express();
// create an endpoint which is just / 
app.get('/', function (req, res) {
    // send message to the listening port that will get the 
    // alert
    console.log('Entered initial page');
    // console.log('req', req);
    // console.log('res', res);
    res.send('Hello Veritas World--');
});

app.get('/blockchain', function (req, res) {
    res.send(dacoin);
});

app.post('/transaction', function (req, res) {
    console.log(req.body);
    res.send(`The amount of the transaction is ${req.body.amount} dacoin.`);
});

app.get('/mine', function (req, res) {
    const lastBlock = dacoin.getLastBlock()
    const previousBlockHash = lastBlock[ 'hash' ];
    const currentBlockData = {
        transactions: dacoin.pendingTransactions,
        index: lastBlock[ 'index' ] + 1,
    };
    const nounce = dacoin.proofOfWork();

    const blockHash = dacoin.hashBlock( previousBlockHash, currentBlockData, nounce );
    const newBlock = dacoin.createNewBlock(nounce, previousBlockHash, blockHash);

    res.json({
        note: 'New block mined successfully',
        block: newBlock,
    });

    dacoin.createNewTransaction(12.5, "00", nodeAddress);
});

app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if( dacoin.networkNodes.indexOf(newNodeUrl) == -1 ){
        dacoin.networkNodes.push(newNodeUrl);
    }
    
    const regNodesPromises = [];
    dacoin.networkNodes.forEach(function(networkNodeUrl, index ){
        const reqestOptions = {
            url: networkNodeUrl+'/register-node',
            method: 'POST',
            body: {
                newNodeUrl: newNodeUrl,
            },
            json: true
        };

        regNodesPromises.push(rp(reqestOptions));
    });

    Promise.all(regNodesPromises)
        .then(function(data){
            const bulkRegisterOptions = {
                uri: newNodeUrl +'/register-nodes-bulk',
                method: 'POST',
                body: {
                    allNetworkNodes: [...dacoin.networkNodes, dacoin.currentNodeUrl],
                },
                json: true
            };

            rp(bulkRegisterOptions);
        }).then(function(data){
            res.json({
                note: 'New node registered with network successfully'
            });
        });
});

app.post( '/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = dacoin.networkNodes.indexOf( newNodeUrl ) == -1;
    const notCurrentNode = dacoin.currentNodeUrl !== newNodeUrl;

    if( nodeNotAlreadyPresent && notCurrentNode ){
        dacoin.networkNodes.push( newNodeUrl );
    }

    res.json( {note: 'New node registered successfully'} );
} );

app.post('/register-nodes-bulk', function( req, res ){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(function(networkNodeUrl){
        const nodeNotAlreadyPresent = dacoin.networkNodes.indexOf( newNodeUrl ) == -1;
        const notCurrentNode = dacoin.currentNodeUrl !== newNodeUrl;
        
        if( nodeNotAlreadyPresent && notCurrentNode ){
            dacoin.networkNodes.push( newNodeUrl );
        }
    });

    res.json({note: 'Bulk registeration successfully'});
});

app.listen(port, function (res, req) {
    console.log(`listening on port ${port}…`);
});