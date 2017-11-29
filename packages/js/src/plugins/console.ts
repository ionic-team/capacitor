import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Console',
  id: 'com.avocadojs.plugin.console'
})
export class Console extends Plugin {
  private queue: any[] = [];

  private originalLog: Function;

  constructor() {
    super();

    this.originalLog = window.console.log;

    window.console.log = (...args: any[]) => {
      // const str = args.map(a => a.toString()).join(' ');
      this.queue.push(['log', ...args]);
      this.originalLog.apply(console, args);
    };

    const syncQueue = () => {
      const queue = this.queue.slice();

      while (queue.length) {
        const logMessage = queue.shift();
        const level = logMessage[0];
        const message = logMessage.slice(1);
        this.nativeCallback('log', { level: level, message: message });
      }
      setTimeout(syncQueue, 100);
    };
    setTimeout(syncQueue);
  }

  windowLog(...args: any[]) {
    this.originalLog.apply(this.originalLog, args);
  }
}
