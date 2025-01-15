const BlockUiJS = {
    blockchain: null,
    init: function () {
        this.fetchBlockChainData();
        $('#transaction-form').on('submit', async function (e) {
            e.preventDefault();
            let formData = new FormData($(this)[0]);
            let formJson = Object.fromEntries(formData.entries());

            // myHeaders.append("Content-Type", "application/x-form-urlencoded");
            // myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formJson),
                // json: true,
                // redirect: 'follow'
            };
            const response = await fetch('/new-transaction', requestOptions);
            const result = await response.json();

            console.log('result', result);
            if (result.blockchain) {
                BlockUiJS.blockchain = result.blockchain;
            }

            if (result.transactionObj) {
                $(this).find('input').val('');
                let entryTable = BlockUiJS.generateTransactionTable(result.transactionObj);

                $('#transaction-entries').html(entryTable);
                BlockUiJS.refreshView();
            }
        });
    },
    refreshView: function () {
        BlockUiJS.generateSummary();
        BlockUiJS.generatePendingTransactionView();
    },
    generatePendingTransactionView: function () {
        let pendingTransactions = BlockUiJS.blockchain.pendingTransactions;
        if (pendingTransactions.length) {
            let table = $(`<h2>All Pending Transactions</h2>
                <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Transactions</th>
                            </tr>
                        </thead>
                        <tbody class="transaction-tbody">
    
                        </tbody>
                    </table>`);

            for (let i = 0; i < pendingTransactions.length; i++) {
                let trans = pendingTransactions[i];
                table.find('tbody.transaction-tbody').append(
                    $(`<tr>
                            <td>${i + 1}</td>
                            <td>
                                <table class="entries-table table table-hover table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Amount</th>
                                            <td>${trans.amount}</td>
                                        </tr>
                                        <tr>
                                            <th>Sender</th>
                                            <td>${trans.sender}</td>
                                        </tr>
                                        <tr>
                                            <th>Recipient</th>
                                            <td>${trans.recipient}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>`)
                );
            }

            $('#pending-transactions').html(table);
        }

    },
    generateTransactionTable: function (transactionObj) {
        let entryTable = $(`
            <h4>New Transaction Details</h4>
            <hr>
            <table class="entries-table table table-hover table-bordered">
            <tbody>
                <tr>
                    <th>Amount</th>
                    <td>${transactionObj.amount}</td>
                </tr>
                <tr>
                    <th>Sender</th>
                    <td>${transactionObj.sender}</td>
                </tr>
                <tr>
                    <th>Recipient</th>
                    <td>${transactionObj.recipient}</td>
                </tr>
            </tbody>
        </table><p class="text-primary text-center">Go to "Home" to see block chain summary</p>`);  
        return entryTable;
    },
    generateSummary: function () {
        if (BlockUiJS.blockchain != null) {
            let summary = $(`
                            <div class="w-50">
                                <h4>Block Chain Summary</h4>
                                <table class="table table-hover table-stripedx table-sm table-bordered text-start">
                                    <tbody>
                                        <tr>
                                            <th>No. of chains</th>
                                            <td>${BlockUiJS.blockchain.chain.length}</td>
                                        </tr>
                                        <tr>
                                            <th>No. of pending transactions</th>
                                            <td>${BlockUiJS.blockchain.pendingTransactions.length}</td>
                                        </tr>
                                        <tr>
                                            <th>No. of network nodes</th>
                                            <td>${BlockUiJS.blockchain.networkNodes.length}</td>
                                        </tr>
                                        <tr>
                                            <th>Current node</th>
                                            <td>${window.location.origin}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`);
            $('#block-summary').html(summary);
        }
    },
    fetchBlockChainData: function () {
        fetch('/blockchain')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                BlockUiJS.blockchain = data.blockchain;
                // this.generateSummary();
                this.refreshView();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    },
}

BlockUiJS.init();