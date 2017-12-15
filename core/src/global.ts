import { Avocado as _Avocado } from './definitions';

var Avocado:_Avocado = {
  Plugins: null
};

declare var window: any;
Avocado = window.Avocado || Avocado;

const Plugins = Avocado.Plugins;

export { Avocado, Plugins };
