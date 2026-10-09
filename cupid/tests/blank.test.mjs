import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,validateTree,evaluate} from '../dist/engine.js';
test('new users start with independent blank trees that persist as drafts',()=>{
 const state=initialState();
 for(const p of state.profiles){assert.deepEqual(p.tree,{start:'',nodes:[]});assert.deepEqual(validateTree(JSON.parse(JSON.stringify(p.tree)),{allowUnconnected:true}),[]);assert.equal(evaluate(p.tree,p,state.profiles[1]).status,'invalid');}
 assert.notEqual(state.profiles[0].tree,state.profiles[1].tree);
});
