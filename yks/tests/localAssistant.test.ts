import { describe, expect, it } from 'vitest';
import { assistantReply, findTopic, norm } from '../src/services/localAssistant';
import { defaultState } from '../src/store/schema';

const state = defaultState();

describe('yerel asistan', () => {
  it('normalizes Turkish characters', () => {
    expect(norm('Kurtuluş Savaşı!')).toBe('kurtulus savasi');
  });

  it('finds topics by name and synonyms', () => {
    expect(findTopic('türev nedir')?.topic.name).toBe('Türev');
    expect(findTopic('Kurtuluş Savaşı özet')?.topic.id).toBe('tyttar-milli-mucadele');
    expect(findTopic('mol kavramı örnek çöz')?.topic.name).toBe('Mol Kavramı');
  });

  it('computes net from free text before other intents', async () => {
    const r = await assistantReply({ action: 'serbest', message: '35 doğru 8 yanlış', state });
    expect(r).toContain('33');
  });

  it('says it does not understand instead of inventing', async () => {
    const r = await assistantReply({ action: 'serbest', message: 'qwzx', state });
    expect(r).toMatch(/anlayamadım/);
  });
});
