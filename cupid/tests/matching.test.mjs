import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../dist/engine.js';
import {matchingFeed} from '../dist/matching.js';
test('blank users have zero matches and no questions',()=>{const s=initialState();assert.deepEqual(matchingFeed(s.profiles,s.profiles[0]),{count:0,questions:[]});});
test('feed hides owners and paths and moves on after rejection',()=>{
 const s=initialState({demo:true}),u=s.profiles[0],a=s.profiles[1];u.answers={};
 const b=structuredClone(a);b.id='third';b.tree.nodes[0].key='different';b.tree.nodes[0].label='Another question';s.profiles.push(b);
 const feed=matchingFeed(s.profiles,u);assert.equal(feed.questions[0].key,'kind');assert.deepEqual(Object.keys(feed.questions[0]).sort(),['key','label','type']);
 u.answers.kind=false;const next=matchingFeed(s.profiles,u);assert.equal(next.count,0);assert.equal(next.questions[0].key,'different');assert.equal(next.questions.some(q=>q.key==='activity'),false);
 assert.equal(matchingFeed(s.profiles,u,new Set(['different'])).questions.length,0);
});
