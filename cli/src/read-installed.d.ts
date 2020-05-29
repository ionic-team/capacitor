interface Opt {
  dev?: boolean,
  log?: () => void,
  depth?: number,
}

interface PkgNode {
  path: string,
  parent: PkgNode,
  dependencies: PkgNode[],
}

type Func = (err: Error, tree: PkgNode) => void;

declare module 'read-installed' {
  function readInstalled(folder: string, options: Opt, func: Func): void;
  export = readInstalled;
}
