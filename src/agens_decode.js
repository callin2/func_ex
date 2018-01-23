"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isGraphNode(arg) {
    return arg.group === 'node';
}
exports.isGraphNode = isGraphNode;
function isGraphEdge(arg) {
    return arg.group === 'edge';
}
exports.isGraphEdge = isGraphEdge;
function toIdString(agraphId) {
    return agraphId.oid + '.' + agraphId.id;
}
function processRecord(fld, graphBuff = []) {
    if (fld['edges'] && fld['vertices']) {
        processPath(fld, graphBuff);
    }
    else if (fld['eid']) {
        processRelationship(fld, graphBuff);
    }
    else if (fld['vid']) {
        processNode(fld, graphBuff);
    }
    else if (fld instanceof Array) {
        for (let f of fld) {
            processRecord(f, graphBuff);
        }
    }
    else if (typeof fld === 'string') {
        // this.fire('vertex', {
        //   id: fld,
        //   name: fld,
        //   props: {}
        // });
    }
}
function processNode(aNode, graphBuff) {
    // console.log('processNode', aNode);
    graphBuff.push({
        group: 'node',
        data: Object.assign({ id: toIdString(aNode.vid), labels: [aNode.label] }, aNode.props)
    });
}
function processRelationship(rel, graphBuff) {
    // console.log('processRelationship', rel);
    graphBuff.push({
        group: 'edge',
        data: Object.assign({ id: 'E:' + toIdString(rel.eid), source: toIdString(rel.svid), target: toIdString(rel.evid), labels: [rel.label] }, rel.props)
    });
}
function processPath(path, graphBuff) {
    for (let v of path.vertices) {
        processNode(v, graphBuff);
    }
    for (let e of path.edges) {
        processRelationship(e, graphBuff);
    }
}
function ag_decode(response) {
    let graphBuff = [];
    for (let row of response.rows) {
        for (let attrKey of Object.keys(row)) {
            processRecord(row[attrKey], graphBuff);
        }
    }
    return graphBuff;
}
exports.ag_decode = ag_decode;
//# sourceMappingURL=agens_decode.js.map