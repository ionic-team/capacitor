import { Rule, Tree } from '@angular-devkit/schematics';
import { spawn } from 'child_process';
import { Observable } from 'rxjs';

export default function({ command, args }: { command: string; args: string[]; }): Rule {
  return (host: Tree) => {
    return new Observable<Tree>(subscriber => {
      const child = spawn(command, args, { stdio: 'inherit' });
      child.on('error', error => {
        subscriber.error(error);
      });
      child.on('close', () => {
        subscriber.next(host);
        subscriber.complete();
      });
      return () => {
        child.kill();
      };
    });
  };
}
