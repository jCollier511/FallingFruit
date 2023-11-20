const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<div class="has-text-light has-text-centered mt-0 pt-0 has-background-dark">
<slot>Contact: jdc8127@rit.edu</slot>
</div>
`;

class AppFooter extends HTMLElement{
  constructor(){
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
} 

customElements.define('app-footer', AppFooter);