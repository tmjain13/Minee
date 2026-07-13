import { describe, expect, it } from 'vitest';
import { executeKashidSearch, viharSearchEngine } from './viharSearchEngine';

const locationDb = [
  { name: 'मुनिश्री विनय कुमार जी', location: 'मॉडल टाउन', address: 'दिल्ली', status: 'शासनश्री', title: '' },
  { name: 'साध्वीश्री सुमनश्री जी', location: 'रोहिणी', address: 'दिल्ली', status: 'शासनश्री', title: '' },
];

const quizDb = [
  { question: 'सामायिक का अर्थ क्या है?', explanation: 'समभाव की साधना' },
  { question: 'पर्युषण पर्व कब मनाया जाता है?', explanation: 'भाद्रपद माह में' },
];

describe('viharSearchEngine', () => {
  it('returns none for an empty query', () => {
    expect(viharSearchEngine('', quizDb, locationDb)).toEqual({ type: 'none', data: null });
  });

  it('returns none for a query with only single-character tokens', () => {
    expect(viharSearchEngine('a b', quizDb, locationDb)).toEqual({ type: 'none', data: null });
  });

  it('finds a location match by direct Hindi substring', () => {
    const result = viharSearchEngine('रोहिणी', quizDb, locationDb);
    expect(result.type).toBe('location');
    expect(result.data).toBe(locationDb[1]);
  });

  it('translates a Hinglish query to Devanagari and finds a location match', () => {
    const result = viharSearchEngine('rohini', quizDb, locationDb);
    expect(result.type).toBe('location');
    expect(result.data).toBe(locationDb[1]);
  });

  it('finds a quiz match when the query overlaps quiz content more strongly', () => {
    const result = viharSearchEngine('samayik अर्थ', quizDb, locationDb);
    expect(result.type).toBe('quiz');
    expect(result.data).toBe(quizDb[0]);
  });

  it('returns none when nothing clears the match threshold', () => {
    const result = viharSearchEngine('xyz completely unrelated', quizDb, locationDb);
    expect(result).toEqual({ type: 'none', data: null });
  });
});

describe('executeKashidSearch', () => {
  const ledger = [
    { id: 1, region: 'DELHI', zone: 'रोहिणी', thana: 'ठाणा-४', name: 'साध्वीश्री सुमनश्री जी', venue: 'तेरापंथ भवन, रोहिणी' },
    { id: 2, region: 'RAJASTHAN', zone: 'लाडनूं', thana: 'ठाणा-१', name: 'आचार्य श्री महाश्रमणजी', venue: 'महाश्रमण विहार, लाडनूं' },
  ];

  it('returns the full ledger for an empty query', () => {
    expect(executeKashidSearch('', ledger)).toEqual(ledger);
    expect(executeKashidSearch('   ', ledger)).toEqual(ledger);
  });

  it('filters by region case-insensitively', () => {
    expect(executeKashidSearch('rajasthan', ledger)).toEqual([ledger[1]]);
  });

  it('filters by zone/venue substring', () => {
    expect(executeKashidSearch('रोहिणी', ledger)).toEqual([ledger[0]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(executeKashidSearch('nonexistent-place', ledger)).toEqual([]);
  });
});
