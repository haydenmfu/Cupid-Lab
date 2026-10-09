export function containQuestion(tree,questionId,blockId,slot){
 const q=tree.nodes.find(n=>n.id===questionId),block=tree.nodes.find(n=>n.id===blockId);
 if(!q||!block||!['count','sum'].includes(block.type)||q.type!==(block.type==='count'?'boolean':'scale'))throw Error('Use binary questions for At least N and scalar questions for Sum score.');
 if(tree.start===q.id)throw Error('Choose a different start node before placing this question inside a block.');
 if(slot<0||slot>=block.inputs.length||block.inputs[slot])throw Error('Choose an empty slot.');
 if(tree.nodes.some(n=>n.yes===q.id||n.no===q.id||n.ranges?.some(r=>r.to===q.id)||n.options?.some(o=>o.to===q.id))||q.yes||q.no||q.ranges?.some(r=>r.to))throw Error('Disconnect this question’s flow branches before placing it inside a block.');
 for(const n of tree.nodes)if(['count','sum'].includes(n.type))n.inputs=n.inputs.map(id=>id===q.id?'':id);
 q.mode='input';block.inputs[slot]=q.id;
}
export function releaseQuestion(tree,blockId,slot,x,y){
 const block=tree.nodes.find(n=>n.id===blockId),q=tree.nodes.find(n=>n.id===block.inputs[slot]);
 block.inputs[slot]='';if(q){q.x=x;q.y=y;}
}
