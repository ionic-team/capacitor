# Plugin API: JavaScript

The Avocado JavaScript API handles proxying calls to the Avocado cross-platform runtime.

We recommend building plugins in TypeScript, which makes it easy to use Avocado's types
during development of the JS side of your plugin.

```typescript
import { Plugin } from '@avocado/plugin';

import { Contact, Person } from './definitions';

@Plugin({
  name: 'Contacts',
  id: 'avocado-plugin-contacts'
})
export class Contacts {
  async create(person: Person) : Contact {
    return await this.call('create', {
      person
    });
  }

  async delete(contact: Contact) {
    return await this.call('delete', {
      contact
    });
  }
}
```