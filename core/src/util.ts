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

export const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
