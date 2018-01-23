"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const most_1 = require("most");
const request = require("superagent");
const agens_decode_1 = require("./agens_decode");
let query2fetch = function (query) {
    console.log('query2fetch', query);
    return fetch('http://localhost:8888/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    })
        .then(res => res.json())
        .catch(err => {
        console.error(err);
        return err;
    });
};
let sa_query2fetch = function (query) {
    return request.post('http://localhost:8888/api/v1/query')
        .send({ query });
};
let resToGraph = function (res) {
    return agens_decode_1.ag_decode(res.body);
};
let $cypherQuery = most_1.from(['MATCH p=()-[]->()-[r:charges]->() return p LIMIT 100;']);
let $graphElem = $cypherQuery
    .map(sa_query2fetch)
    .chain(most_1.fromPromise)
    .recoverWith((e) => {
    console.error(e);
    return most_1.of(e.response);
})
    .map(resToGraph)
    .chain(most_1.from);
class MiniGraphDB {
    constructor() {
        this.store = { nodes_idx: {}, edges_idx: {}, node_label_idx: {}, edge_label_idx: {}, allNodes: [], allEdges: [] };
    }
    insert(ele) {
        if (agens_decode_1.isGraphEdge(ele)) {
            this.store.allEdges.push(ele);
            this.store.edges_idx[ele.data.id] = ele;
            ele.data.labels.forEach(lbl => {
                let labelIdx = this.store.edge_label_idx[lbl];
                if (!labelIdx)
                    labelIdx = this.store.edge_label_idx[lbl] = {};
                labelIdx[ele.data.id] = ele;
            });
        }
        else if (agens_decode_1.isGraphNode(ele)) {
            this.store.allNodes.push(ele);
            this.store.nodes_idx[ele.data.id] = ele;
            ele.data.labels.forEach(lbl => {
                let labelIdx = this.store.node_label_idx[lbl];
                if (!labelIdx)
                    labelIdx = this.store.node_label_idx[lbl] = [];
                labelIdx[ele.data.id] = ele;
            });
        }
    }
}
var db = new MiniGraphDB();
$graphElem.subscribe({
    next: (value) => {
        console.log(value);
        db.insert(value);
    },
    error: (err) => { },
    complete: (value) => {
    }
});
/*

MATCH (n2:block)-[r2:next*..2]->(n3:block)
WHERE n2.bc_block_id=to_jsonb(61900)
RETURN r2,n2,n3



(n1:block {})-[:next {}]->()-[:next {}]->(n2:block {}) => (n1)-[:lll {}]->(n2)

(n1:block) => (:xlock {id: n1.id, extraInfo: n1 })
[r1:next] => [:r01 {source: r1.source }]->(:tmpnode {id: nodeid()})-[:r02 {target: r1.target}]
(n1:block)-->(n2:block) => (:blocks {id:n1.id + n2.id , blockList:[n1,n2]})



 */
// sequence(fluture, array)([of(1), reject('ops')]).fork(() => console.error('error'), xs => console.log(xs)) // => "error"
//# sourceMappingURL=add.js.map