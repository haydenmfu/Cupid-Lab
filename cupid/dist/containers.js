export function containQuestion(tree,questionId,blockId,slot){
 const q=tree.nodes.find(n=>n.id===questionId),block=tree.nodes.find(n=>n.id===blockId);
 if(!q||q.type!=='boolean'||!block||block.type!=='count')throw Error('Drop a binary question into an At least N slot.');
 if(tree.start===q.id)throw Error('Choose a different start node before placing this question inside a block.');
 if(slot<0||slot>=block.inputs.length||block.inputs[slot])throw Error('Choose an empty slot.');
 if(tree.nodes.some(n=>n.yes===q.id||n.no===q.id||n.ranges?.some(r=>r.to===q.id)||n.options?.some(o=>o.to===q.id))||q.yes||q.no)throw Error('Disconnect this question’s flow branches before placing it inside a block.');
 for(const n of tree.nodes)if(n.type==='count')n.inputs=n.inputs.map(id=>id===q.id?'':id);
 q.mode='input';block.inputs[slot]=q.id;
}
export function releaseQuestion(tree,blockId,slot,x,y){
 const block=tree.nodes.find(n=>n.id===blockId),q=tree.nodes.find(n=>n.id===block.inputs[slot]);
 block.inputs[slot]='';if(q){q.x=x;q.y=y;}
}
