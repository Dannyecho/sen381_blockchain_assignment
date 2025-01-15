const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./lab7/blockchain');
const app = express();  
const port = 3000;  
const dacoin = new Blockchain();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static('public'));
// Serve HTML file  
app.get('/', (req, res) => {  
    res.sendFile(__dirname + '/public/index.html');  
});  

app.get('/blockchain', function (req, res) {
    res.json({'blockchain': dacoin});
});

app.post('/transaction', function (req, res) {
    res.send(`The amount of the transaction is ${req.body.amount} dacoin.`);
});
app.post('/new-transaction', function (req, res) {
    let transactionObj = dacoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient );
    res.json({
        blockchain: dacoin,
        transactionObj: transactionObj,
    });
    // res.send(`The amount of the transaction is ${req.body.amount} dacoin.`);
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

app.listen(port, () => {  
    console.log(`Server running at http://localhost:${port}`);  
});