const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<div class="has-text-centered mt-0 pt-0 pb-2 has-background-danger">
<h1 class="title has-text-white">Falling Fruit</h1>
</div>
`;

class AppHeader extends HTMLElement{
  constructor(){
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
} 

customElements.define('app-header', AppHeader);