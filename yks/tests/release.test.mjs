import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRoute } from '../src/utils/route.ts';
import { defaultState } from '../src/store/schema.ts';
import { answerQuestion, startTest, updateProfile } from '../src/store/actions.ts';
import { loadState, saveState, STORAGE_KEY } from '../src/store/storage.ts';
import { restoreBackup } from '../src/services/backupRestore.ts';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { allTopics, getTopicRef, SUBJECTS } from '../src/data/curriculum/index.ts';
import { calcNet } from '../src/utils/net.ts';
import { parseBackup } from '../src/store/storage.ts';

const config = { exam: 'TYT', subjectId: 'all', topicId: 'all', subtopicId: 'all', difficulty: 'all', type: 'all', count: 1, mode: 'sinav', origin: 'filtre' };
const now = new Date('2026-09-30T10:00:00Z');

test('malformed shared links do not crash the app or lose query values', () => {
  const route = parseRoute('#/konu/%E0%A4%A?not=a?b');
  assert.equal(route.segments[1], '%E0%A4%A');
  assert.equal(route.query.get('not'), 'a?b');
});

test('expired exams reject answers even before the next timer tick', () => {
  const state = startTest(defaultState(), config, ['q1'], now);
  assert.equal(answerQuestion(state, 'q1', 2, new Date(now.getTime() + 90_001)), state);
  assert.equal(answerQuestion(state, 'outside', 2, now), state);
  assert.equal(answerQuestion(state, 'q1', 5, now), state);
  assert.equal(answerQuestion(state, 'q1', 2, now).activeTest.answers.q1, 2);
});

test('profile targets remain valid after edits and backup migration', () => {
  const state = updateProfile(defaultState(), { dailyQuestionGoal: 999, dailyStudyMinutes: Infinity, tytTarget: 121, aytTarget: -2 });
  assert.equal(state.profile.dailyQuestionGoal, 500);
  assert.equal(state.profile.dailyStudyMinutes, 180);
  assert.equal(state.profile.tytTarget, 120);
  assert.equal(state.profile.aytTarget, 0);
});

test('storage getter failures are reported instead of crashing startup', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    assert.match(loadState(undefined, { topics: [] }).error, /depolama/i);
    assert.equal(saveState(defaultState()), false);
  } finally {
    delete globalThis.localStorage;
  }
});

test('unrecognized saved data is reported and preserved', () => {
  const text = '{"otherApp":true}';
  const storage = { getItem: key => key === STORAGE_KEY ? text : null };
  assert.ok(loadState(storage, { topics: [] }).error);
  assert.equal(storage.getItem(STORAGE_KEY), text);
});

function restoreFixture(fail) {
  const previous = defaultState();
  previous.notebookPages = [{ id: 'original', title: 'Old', createdAt: now.toISOString(), updatedAt: now.toISOString() }];
  const incoming = structuredClone(previous);
  incoming.profile.name = 'Yeni';
  const images = new Map([['original', 'old drawing']]);
  let photo = 'old photo';
  let state = previous;
  const ports = {
    readPhoto: async () => photo,
    stageAssets: async (entries, nextPhoto) => {
      if (fail === 'assets') throw new Error('QuotaExceededError');
      for (const [id, image] of Object.entries(entries)) images.set(id, image);
      photo = nextPhoto;
    },
    rollbackAssets: async (ids, oldPhoto) => { for (const id of ids) images.delete(id); photo = oldPhoto; },
    commitState: next => { if (fail === 'state') return false; state = next; return true; },
    cleanupImages: async ids => { for (const id of ids) images.delete(id); },
  };
  return { previous, incoming, images, ports, get state() { return state; }, get photo() { return photo; } };
}

test('failed asset imports keep the current profile and notebook', async () => {
  const f = restoreFixture('assets');
  await assert.rejects(restoreBackup(f.incoming, { original: 'new drawing' }, 'new photo', f.previous, f.ports));
  assert.equal(f.state, f.previous);
  assert.equal(f.images.get('original'), 'old drawing');
  assert.equal(f.photo, 'old photo');
});

test('failed profile writes roll back staged assets', async () => {
  const f = restoreFixture('state');
  await assert.rejects(restoreBackup(f.incoming, { original: 'new drawing' }, 'new photo', f.previous, f.ports), /kaydedilemedi/);
  assert.equal(f.state, f.previous);
  assert.equal(f.images.size, 1);
  assert.equal(f.images.get('original'), 'old drawing');
  assert.equal(f.photo, 'old photo');
});

test('successful imports keep drawings attached to remapped notebook pages', async () => {
  const f = restoreFixture();
  await restoreBackup(f.incoming, { original: 'new drawing', orphan: 'ignored' }, 'new photo', f.previous, f.ports);
  const id = f.state.notebookPages[0].id;
  assert.notEqual(id, 'original');
  assert.equal(f.images.get(id), 'new drawing');
  assert.equal(f.images.size, 1);
  assert.equal(f.state.profile.name, 'Yeni');
  assert.ok(f.state.deleted.original, 'Cloud sync must not revive remapped notebook pages');
  assert.equal(f.photo, 'new photo');
});

test('new profile fields and bounded targets survive backup restore', () => {
  const raw = defaultState();
  raw.profile.targetUniversity = 'Hedef Üniversite';
  raw.profile.targetDepartment = 'Bilgisayar Mühendisliği';
  raw.profile.preferredStudyTime = '19:30';
  raw.profile.tytTarget = 999;
  const parsed = parseBackup(JSON.stringify(raw));
  assert.equal(parsed.state.profile.targetUniversity, raw.profile.targetUniversity);
  assert.equal(parsed.state.profile.targetDepartment, raw.profile.targetDepartment);
  assert.equal(parsed.state.profile.preferredStudyTime, '19:30');
  assert.equal(parsed.state.profile.tytTarget, 120);
});

test('exam scoring follows four-wrongs-cancel-one-right', () => {
  assert.equal(calcNet(100, 20), 95);
  assert.equal(calcNet(0, 4), -1);
});

test('all subject question banks contain unique valid questions with real curriculum references', async () => {
  assert.equal(SUBJECTS.length, 15);
  const seen = new Set();
  const covered = new Set();
  const directory = new URL('../src/data/questions/', import.meta.url);
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.ts'))) {
    const { questions } = await import(new URL(file, directory).href);
    for (const question of questions) {
      assert.ok(!seen.has(question.id), `Duplicate question ${question.id}`);
      seen.add(question.id);
      assert.equal(question.options.length, 5, question.id);
      assert.ok(Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer <= 4, question.id);
      const reference = getTopicRef(question.topic);
      assert.ok(reference, `Unknown topic ${question.topic}`);
      assert.ok(question.solution.trim().length > 0, `Missing solution ${question.id}`);
      covered.add(reference.topic.id);
    }
  }
  assert.ok(seen.size >= 1000, 'Question bank is incomplete');
  for (const { topic } of allTopics()) assert.ok(covered.has(topic.id), `No questions for ${topic.id}`);
  console.log(`Question bank: ${seen.size} questions, ${covered.size} topics, ${SUBJECTS.length} subjects.`);
});

function workerFixture(fetchResult) {
  const handlers = {};
  let activations = 0;
  const cached = new Response('offline app', { headers: { 'Content-Type': 'text/html' } });
  const self = {
    location: { origin: 'https://example.test' },
    registration: { scope: 'https://example.test/cumaaa/yks/' },
    addEventListener: (name, fn) => { handlers[name] = fn; },
    skipWaiting: async () => { activations++; },
  };
  const cache = { addAll: async () => {}, put: async () => {}, match: async () => cached.clone() };
  const caches = { open: async () => cache, match: async () => cached.clone() };
  const source = readFileSync(new URL('../scripts/sw-template.js', import.meta.url), 'utf8').replace('__VERSION__', 'test').replace('__PRECACHE__', '["./index.html"]');
  vm.runInNewContext(source, { self, caches, fetch: fetchResult, Response, URL });
  return { handlers, get activations() { return activations; } };
}

test('service worker updates wait for the user instead of replacing the active session', async () => {
  const fixture = workerFixture(async () => new Response('online'));
  let pending;
  fixture.handlers.install({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.equal(fixture.activations, 0);
  fixture.handlers.message({ data: { type: 'SKIP_WAITING' }, waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.equal(fixture.activations, 1);
});

test('temporary server failures fall back to the offline app', async () => {
  const fixture = workerFixture(async () => new Response('unavailable', { status: 503 }));
  let response;
  fixture.handlers.fetch({ request: { url: 'https://example.test/cumaaa/yks/?v=new', method: 'GET', mode: 'navigate' }, respondWith: (promise) => { response = promise; } });
  assert.equal(await (await response).text(), 'offline app');
});

test('the app service worker does not intercept another project on the same origin', () => {
  const fixture = workerFixture(async () => new Response('online'));
  let intercepted = false;
  fixture.handlers.fetch({ request: { url: 'https://example.test/another-project/', method: 'GET', mode: 'navigate' }, respondWith: () => { intercepted = true; } });
  assert.equal(intercepted, false);
});
