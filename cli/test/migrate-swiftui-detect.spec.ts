import { __testables } from '../src/tasks/migrate-swiftui';

const { classify, describeSignals } = __testables;

const NOTHING_MIGRATED = {
  hasSwiftUIManifest: false,
  hasAppStruct: false,
  hasCapacitorView: false,
  hasDelegateAdaptorShape: false,
};

const FULLY_MIGRATED = {
  hasSwiftUIManifest: true,
  hasAppStruct: true,
  hasCapacitorView: true,
  hasDelegateAdaptorShape: true,
};

describe('migrate-swiftui classify', () => {
  it('returns eligible for a project with none of the SwiftUI App-struct markers', () => {
    expect(classify(NOTHING_MIGRATED)).toBe('eligible');
  });

  it('returns already-migrated when every marker is present', () => {
    expect(classify(FULLY_MIGRATED)).toBe('already-migrated');
  });

  it.each(Object.keys(NOTHING_MIGRATED))('stays eligible when only %s is present, so the run can resume', (key) => {
    expect(classify({ ...NOTHING_MIGRATED, [key]: true })).toBe('eligible');
  });

  it.each(Object.keys(FULLY_MIGRATED))('stays eligible when only %s is missing, so the run can resume', (key) => {
    expect(classify({ ...FULLY_MIGRATED, [key]: false })).toBe('eligible');
  });
});

describe('migrate-swiftui describeSignals', () => {
  it('reports every marker as missing for an unmigrated project', () => {
    const description = describeSignals(NOTHING_MIGRATED);

    expect(description).toContain('present: []');
    expect(description).toContain('App.swift');
    expect(description).toContain('CapacitorView.swift');
  });

  it('splits present and missing markers', () => {
    const description = describeSignals({ ...NOTHING_MIGRATED, hasCapacitorView: true });

    expect(description).toMatch(/present: \[CapacitorView\.swift\]/);
    expect(description).toMatch(/missing: \[.*App\.swift.*\]/);
  });
});
