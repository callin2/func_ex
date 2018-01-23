export type GraphNode = {group: 'node', data: {id: string, labels:string[], [key:string]:any}}
export type GraphEdge = {group: 'edge', data: {id: string, labels:string[], source: string, target: string, [key:string]:any}}


export function isGraphNode(arg: any): arg is GraphNode {
    return arg.group === 'node'
}

export function isGraphEdge(arg: any): arg is GraphEdge{
    return arg.group === 'edge'
}



export type GraphElem = GraphNode | GraphEdge
export type Graph = Array<GraphElem>


function toIdString(agraphId: {id:any, oid:any}) {
    return agraphId.oid + '.' + agraphId.id;
}

function processRecord(fld: any, graphBuff:Array<GraphElem> = []) {
    if(fld['edges'] && fld['vertices']) {
        processPath(fld, graphBuff)
    }else if(fld['eid']){
        processRelationship(fld, graphBuff)
    }else if(fld['vid']){
        processNode(fld, graphBuff)
    }else if(fld instanceof Array){
        for(let f of fld) {
            processRecord(f, graphBuff)
        }
    }else if(typeof fld === 'string') {
        // this.fire('vertex', {
        //   id: fld,
        //   name: fld,
        //   props: {}
        // });
    }
}

function processNode(aNode: any, graphBuff:Array<GraphElem>) {
    // console.log('processNode', aNode);
    graphBuff.push({
        group: 'node',
        data: {
            id: toIdString(aNode.vid),
            labels: [aNode.label],
            ...aNode.props,
        }
    });
}

function processRelationship(rel: any, graphBuff:Array<GraphElem>) {
    // console.log('processRelationship', rel);
    graphBuff.push({
        group:'edge',
        data: {
            id: 'E:' + toIdString(rel.eid),
            source: toIdString(rel.svid),
            target: toIdString(rel.evid),
            labels: [rel.label],
            ...rel.props
        }
    });
}

function processPath(path: any, graphBuff: Array<GraphElem>) {
    for(let v of path.vertices) {
        processNode(v, graphBuff);
    }

    for(let e of path.edges) {
        processRelationship(e, graphBuff);
    }
}


export function ag_decode(response): Array<GraphElem>{
    let graphBuff: Array<GraphElem> = []

    for(let row of response.rows) {
        for(let attrKey of Object.keys(row)) {
            processRecord(row[attrKey], graphBuff);
        }
    }

    return graphBuff;
}