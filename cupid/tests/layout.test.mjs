import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutTree} from '../dist/graph-model.js';
const end=id=>({id,type:'terminal',label:id,x:0,y:0,outcome:'match'});
test('cleanup orders scalar destinations by output, independent of node order',()=>{
 const t={start:'s',nodes:[{id:'s',type:'scale',ranges:[{min:1,max:3,to:'low'},{min:4,max:7,to:'mid'},{min:8,max:10,to:'high'}]},end('high'),end('mid'),end('low')]};
 layoutTree(t,{heights:{s:90}});const get=id=>t.nodes.find(n=>n.id===id);
 assert.ok(get('low').x<get('mid').x&&get('mid').x<get('high').x);assert.equal(get('low').y-get('s').y,145);
});
test('yes is left of no and row gaps depend on the preceding row only',()=>{
 const t={start:'b',nodes:[{id:'b',type:'boolean',yes:'yes',no:'no'},end('no'),end('yes')]};layoutTree(t,{heights:{b:85,no:400}});
 assert.ok(t.nodes[2].x<t.nodes[1].x);assert.equal(t.nodes[1].y-t.nodes[0].y,140);
});
