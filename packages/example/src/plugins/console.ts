import { AvocadoPlugin, Plugin } from 'avocado-js';

export declare type LogMessage = any[];

@AvocadoPlugin({
  name: 'Console',
  id: 'com.avocadojs.plugin.console'
})
export class ConsolePlugin extends Plugin {
  queue: LogMessage[] = []

  constructor() {
    super();

    const self = this
    const originalLog = window.console.log;

    window.console.log = (...args) => {
      //const str = args.map(a => a.toString()).join(' ');
      this.queue.push(['log', ...args]);
      originalLog.apply(originalLog, args);
    };
      
    const syncQueue = () => {
      if (this.queue.length) {
        while(this.queue.length) {
          const logMessage = this.queue.shift();
          const level = logMessage[0];
          const message = logMessage.slice(1)
          this.nativeCallback('log', { level: level, message: message });
        }
      }
      setTimeout(syncQueue, 100);
    };
    setTimeout(syncQueue);
  }
}