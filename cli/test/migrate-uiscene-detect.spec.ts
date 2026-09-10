import { __testables } from '../src/tasks/migrate-uiscene';

const { classify } = __testables;

describe('migrate-uiscene classify', () => {
  it('returns eligible when nothing scene-related is present', () => {
    expect(
      classify({
        hasManifest: false,
        hasSceneDelegate: false,
        hasConfigurationForConnecting: false,
      }),
    ).toBe('eligible');
  });

  it('returns already-migrated when all three signals are present', () => {
    expect(
      classify({
        hasManifest: true,
        hasSceneDelegate: true,
        hasConfigurationForConnecting: true,
      }),
    ).toBe('already-migrated');
  });

  it.each([
    [{ hasManifest: true, hasSceneDelegate: false, hasConfigurationForConnecting: false }],
    [{ hasManifest: false, hasSceneDelegate: true, hasConfigurationForConnecting: false }],
    [{ hasManifest: false, hasSceneDelegate: false, hasConfigurationForConnecting: true }],
    [{ hasManifest: true, hasSceneDelegate: true, hasConfigurationForConnecting: false }],
    [{ hasManifest: true, hasSceneDelegate: false, hasConfigurationForConnecting: true }],
    [{ hasManifest: false, hasSceneDelegate: true, hasConfigurationForConnecting: true }],
  ])('returns partial for mixed signals %j', (signals) => {
    expect(classify(signals)).toBe('partial');
  });
});
