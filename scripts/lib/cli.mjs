export const execute = fn => {
  fn().catch(err => {
    console.error(err);
    process.exit(1);
  });
};
