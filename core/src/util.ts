/* eslint-disable */
export const extend = (target: any, ...objs: any[]) => {
  objs.forEach(o => {
    if (o && typeof o === 'object') {
      for (const k in o) {
        if (o.hasOwnProperty(k)) {
          target[k] = o[k];
        }
      }
    }
  });
  return target;
};
