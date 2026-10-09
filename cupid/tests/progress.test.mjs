import test from 'node:test';
import assert from 'node:assert/strict';
import {treeProgress} from '../dist/progress.js';
import {validateTree} from '../dist/engine.js';
const fixture=()=>({start:'a',completionThreshold:50,nodes:[{id:'a',type:'boolean',key:'a',label:'A',x:0,y:0,yes:'b',no:'r'},{id:'b',type:'boolean',key:'b',label:'B',x:0,y:0,yes:'m',no:'r'},{id:'m',type:'terminal',label:'Compatible',outcome:'match',x:0,y:0},{id:'r',type:'terminal',label:'Reject',outcome:'reject',x:0,y:0}]});
test('threshold accepts partial compatible progress but explicit rejection stays final',()=>{const t=fixture(),owner={attraction:{}},person={answers:{a:true}};assert.deepEqual(treeProgress(t,owner,person),{passed:1,total:2,qualified:true});t.completionThreshold=100;assert.equal(treeProgress(t,owner,person).qualified,false);t.completionThreshold=50;person.answers.b=false;assert.equal(treeProgress(t,owner,person).qualified,false);person.answers.b=true;assert.deepEqual(treeProgress(t,owner,person),{passed:2,total:2,qualified:true});});
test('invalid thresholds and outcome values are rejected',()=>{const t=fixture();t.completionThreshold=0;assert.ok(validateTree(t).length);t.completionThreshold=70;t.nodes[2].outcome='anything';assert.ok(validateTree(t).length);});
