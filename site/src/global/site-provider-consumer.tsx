import { createProviderConsumer } from '@stencil/state-tunnel';
import { h } from '@stencil/core';

export interface SiteState {
  isLeftSidebarIn: boolean,
  toggleLeftSidebar: () => void
}

export default createProviderConsumer<SiteState>({
    isLeftSidebarIn: false,
    toggleLeftSidebar: () => {}
  },
  (subscribe, child) => <context-consumer subscribe={subscribe} renderer={child} />
);