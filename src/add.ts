import {from, unfold, fromPromise, of, Subscription} from 'most'
import * as request from 'superagent'
import {ag_decode, GraphEdge, GraphElem, GraphNode, isGraphEdge, isGraphNode} from "./agens_decode";


let query2fetch = function(query): Promise<Response> {
    console.log('query2fetch', query)

    return fetch('http://localhost:8888/api/v1/query',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
    })
    .then(res=>res.json())
    .catch(err=>{
        console.error(err)
        return err;
    })
};

let sa_query2fetch = function(query): Promise<Response> {
    return request.post('http://localhost:8888/api/v1/query')
        .send({query})
};


let resToGraph = function(res: Response):Array<GraphElem> {
    return ag_decode(res.body);
};

let $cypherQuery = from(['MATCH p=()-[]->()-[r:charges]->() return p LIMIT 100;']);

let $graphElem = $cypherQuery
    .map( sa_query2fetch)
    .chain(fromPromise)
    .recoverWith((e:{response:Response}) => {
        console.error(e);
        return of(e.response);
    })
    .map(resToGraph)
    .chain(from);


class MiniGraphDB {
    store: any;

    constructor() {
        this.store = {nodes_idx:{}, edges_idx:{}, node_label_idx:{}, edge_label_idx:{}, allNodes:[], allEdges:[]}
    }

    public insert(ele: GraphElem) {
        if(isGraphEdge(ele)) {
            this.store.allEdges.push(ele);
            this.store.edges_idx[ele.data.id] = ele;

            ele.data.labels.forEach(lbl=>{
                let labelIdx = this.store.edge_label_idx[lbl]
                if(!labelIdx) labelIdx = this.store.edge_label_idx[lbl] = {}
                labelIdx[ele.data.id] = ele
            });
        }else if(isGraphNode(ele)) {
            this.store.allNodes.push(ele);
            this.store.nodes_idx[ele.data.id] = ele;

            ele.data.labels.forEach(lbl=>{
                let labelIdx = this.store.node_label_idx[lbl]
                if(!labelIdx) labelIdx = this.store.node_label_idx[lbl] = []
                labelIdx[ele.data.id] = ele
            });
        }
    }
}

var db = new MiniGraphDB()

$graphElem.subscribe({
    next: (value: GraphElem)=>{
        console.log(value)
        db.insert(value)
    },
    error: (err: Error)=>{},
    complete: (value?)=>{
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
