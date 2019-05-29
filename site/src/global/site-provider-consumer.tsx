import { createProviderConsumer } from '@stencil/state-tunnel';

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