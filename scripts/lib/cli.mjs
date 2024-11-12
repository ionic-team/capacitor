export const execute = (fn) => {
  fn().catch((e) => {
    process.stderr.write(e.stack ?? e);
    process.exit(1);
  });
};
