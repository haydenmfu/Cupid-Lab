import test from 'node:test';
import assert from 'node:assert/strict';
import {containQuestion,releaseQuestion} from '../dist/containers.js';
const fixture=()=>({start:'b',nodes:[{id:'b',type:'count',inputs:['',''],threshold:1},{id:'q',type:'boolean',label:'Anime?',yes:'',no:''}]});
test('drop adopts binary question and release preserves its answer identity',()=>{const t=fixture();containQuestion(t,'q','b',0);assert.equal(t.nodes[1].mode,'input');assert.deepEqual(t.nodes[0].inputs,['q','']);releaseQuestion(t,'b',0,100,200);assert.deepEqual(t.nodes[0].inputs,['','']);assert.equal(t.nodes[1].label,'Anime?');assert.equal(t.nodes[1].x,100);});
test('drop rejects wired questions, nonbinary questions, start and occupied slots',()=>{const t=fixture();t.nodes[1].yes='b';assert.throws(()=>containQuestion(t,'q','b',0));t.nodes[1].yes='';t.nodes[1].type='scale';assert.throws(()=>containQuestion(t,'q','b',0));t.nodes[1].type='boolean';t.start='q';assert.throws(()=>containQuestion(t,'q','b',0));t.start='b';t.nodes[0].inputs[0]='other';assert.throws(()=>containQuestion(t,'q','b',0));});
