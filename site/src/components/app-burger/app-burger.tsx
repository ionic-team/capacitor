import { Component, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'app-burger',
  styleUrl: 'app-burger.scss'
})
export class AppBurger {

  @Event() burgerClick: EventEmitter;

  handleBurgerClicked() {
    this.burgerClick.emit();
  }

  render() {
    return (
      <div class="burger" onClick={() => this.handleBurgerClicked() }>
        <app-icon name="menu"></app-icon>
        <app-icon name="close"></app-icon>
      </div>
    )
  }
}
