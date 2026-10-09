// Question values are data connections; yes/no and range branches are flow connections.
export function inputsFor(node){return ['count','sum'].includes(node.type)?node.inputs||[]:[];}
export function migrateTree(tree){
  for(const node of [...tree.nodes]){
    if(node.type!=='count'||!node.items)continue;
    node.inputs=node.items.map((item,i)=>{
      let id=node.id+'_input_'+(i+1);while(tree.nodes.some(n=>n.id===id))id+='_';
      tree.nodes.push({id,type:'boolean',label:item.label,key:item.key,mode:'input',yes:'',no:'',x:Math.max(30,node.x+(i-1)*260),y:Math.max(40,node.y-200)});
      return id;
    });
    delete node.items;
  }
  return tree;
}
export function flowEdges(node){
  if(node.type==='terminal'||node.mode==='input')return [];
  if(node.type==='scale')return (node.ranges||[]).map((r,index)=>({label:`${r.min}–${r.max}`,to:r.to,index}));
  if(node.type==='category')return (node.options||[]).map((r,index)=>({label:r.value,to:r.to,index}));
  return [{label:'Yes',to:node.yes,index:0},{label:'No',to:node.no,index:1}];
}
export function connections(tree){
  return tree.nodes.flatMap(n=>[
    ...flowEdges(n).filter(e=>e.to).map(e=>({kind:'flow',from:n.id,to:e.to,index:e.index,label:e.label})),
    ...inputsFor(n).map((id,index)=>({kind:'data',from:id,to:n.id,index,label:'Input '+(index+1)})).filter(e=>e.from)
  ]);
}
export function setFlow(node,index,to){if(node.type==='scale')node.ranges[index].to=to;else if(node.type==='category')node.options[index].to=to;else node[index===0?'yes':'no']=to;}
export function removeConnection(tree,edge){const n=tree.nodes.find(n=>n.id===(edge.kind==='data'?edge.to:edge.from));if(edge.kind==='data')n.inputs[edge.index]='';else setFlow(n,edge.index,'');}
export function layoutTree(tree,{heights={}}={}){
  // Long edges get virtual nodes, so barycentric sweeps consider crossings across every layer.
  const hidden=new Set(tree.nodes.filter(n=>n.mode==='input'&&tree.nodes.some(b=>['count','sum'].includes(b.type)&&b.inputs?.includes(n.id))).map(n=>n.id));
  const ids=tree.nodes.filter(n=>!hidden.has(n.id)).map(n=>n.id),valid=new Set(ids),links=connections(tree).filter(e=>valid.has(e.from)&&valid.has(e.to));
  if(!ids.length)return {width:1000,height:600,crossings:0};
  const rank=new Map(ids.map(id=>[id,0])),indegree=new Map(ids.map(id=>[id,0]));
  for(const e of links)indegree.set(e.to,indegree.get(e.to)+1);
  const queue=ids.filter(id=>!indegree.get(id));let visited=0;
  while(queue.length){const id=queue.shift();visited++;for(const e of links.filter(e=>e.from===id)){rank.set(e.to,Math.max(rank.get(e.to),rank.get(id)+1));indegree.set(e.to,indegree.get(e.to)-1);if(!indegree.get(e.to))queue.push(e.to);}}
  if(visited!==ids.length)throw Error('Remove loops before cleaning up.');
  const layers=Array.from({length:Math.max(...rank.values())+1},()=>[]),segments=[],paths=new Map();
  for(const id of ids)layers[rank.get(id)].push(id);
  links.forEach((edge,i)=>{let prev=edge.from;const path=new Map();for(let r=rank.get(edge.from)+1;r<rank.get(edge.to);r++){const id='@'+i+':'+r;layers[r].push(id);segments.push([prev,id]);path.set(r,id);prev=id;}segments.push([prev,edge.to]);path.set(rank.get(edge.to),edge.to);paths.set(edge,path);});
  // Respect output order wherever distinct branch paths share a layer.
  const constraints=layers.map(()=>[]);
  for(const id of ids){const outgoing=links.filter(e=>e.from===id&&e.kind==='flow').sort((a,b)=>a.index-b.index);
    for(let i=0;i<outgoing.length;i++)for(let j=i+1;j<outgoing.length;j++)for(const [r,a] of paths.get(outgoing[i])){const b=paths.get(outgoing[j]).get(r);if(b&&a!==b)constraints[r].push([a,b]);}}
  const orderBranches=(row,r)=>{
    const result=[],remaining=new Set(row);
    while(remaining.size){const next=row.find(id=>remaining.has(id)&&!constraints[r].some(([a,b])=>b===id&&remaining.has(a)));
      // Shared destinations can impose conflicting order; retain stable order there.
      if(next===undefined){result.push(...row.filter(id=>remaining.has(id)));break;}result.push(next);remaining.delete(next);}
    return result;
  };
  layers.forEach((row,r)=>layers[r]=orderBranches(row,r));
  const position=()=>new Map(layers.flatMap(row=>row.map((id,i)=>[id,i])));
  const crossings=()=>{const pos=position();let count=0;for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){const [a,b]=segments[i],[c,d]=segments[j];if(a===c||b===d)continue;const row=layers.findIndex(l=>l.includes(a));if(layers[row]?.includes(c)&&layers[row+1]?.includes(b)&&layers[row+1]?.includes(d)&&(pos.get(a)-pos.get(c))*(pos.get(b)-pos.get(d))<0)count++;}return count;};
  let best=layers.map(l=>[...l]),score=crossings();
  for(let pass=0;pass<10;pass++){
    const down=pass%2===0;const order=layers.map((_,i)=>i);if(!down)order.reverse();
    for(const r of order){const pos=position();const bary=id=>{const neighbors=segments.filter(e=>e[down?1:0]===id).map(e=>pos.get(e[down?0:1]));return neighbors.length?neighbors.reduce((a,b)=>a+b,0)/neighbors.length:pos.get(id);};layers[r].sort((a,b)=>bary(a)-bary(b)||pos.get(a)-pos.get(b));}
    layers.forEach((row,r)=>layers[r]=orderBranches(row,r));
    const next=crossings();if(next<=score){score=next;best=layers.map(l=>[...l]);}
  }
  const width=Math.max(1000,...best.map(l=>l.length*280+100));
  let y=60;
  for(const row of best){let tallest=70;row.forEach((id,i)=>{const n=tree.nodes.find(n=>n.id===id);if(n){n.x=Math.round((width-row.length*280)/2+i*280);n.y=y;tallest=Math.max(tallest,heights[id]||(['count','sum'].includes(n.type)?120+(n.inputs?.length||0)*65:120));}});y+=tallest+55;}
  return {width,height:Math.max(600,y+40),crossings:score};
}
