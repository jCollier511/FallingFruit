const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<nav class="navbar has-shadow has-background-success">
<!-- logo /b brand-->
<div class="navbar-brand">
    <a class="navbar-item" href="home.html">
        <img src="./images/strawberry.png" alt="">
    </a>
    <a class="navbar-burger" id="burger">
        <span></span>
        <span></span>
        <span></span>
    </a>
</div>
<div class="navbar-menu" id="nav-links">
    <div class="navbar-start">
        <a class="navbar-item is-hoverable" href="home.html" id="home">
            Home
        </a>
    
        <a class="navbar-item is-hoverable" href="app.html" id="app">
        App
        </a>
    
        <a class="navbar-item is-hoverable" href="documentation.html" id="documentation">
            Documentation
        </a>
    </div> <!-- end navbar-start -->
</div>
</nav>
`;

class AppNavbar extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.burgerIcon = this.shadowRoot.querySelector('#burger');
        this.navbarMenu = this.shadowRoot.querySelector('#nav-links');
        if (this.burgerIcon) this.burgerIcon.onclick = () => this.navbarMenu.classList.toggle("is-active");

        const page = this.getAttribute('current-page');
        this.shadowRoot.querySelector(`#${page}`).classList.add('has-text-weight-bold');
    }
  } 
  
  customElements.define('app-navbar', AppNavbar);