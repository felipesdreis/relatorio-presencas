<template>
  <div>
    <!-- Menu de Navegação -->
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Relatório de Presenças</b-navbar-brand>
      <!-- Adicione um ref no b-navbar-toggle -->
      <b-navbar-toggle target="nav-collapse" ref="navbarToggle"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <!-- Simula o clique no toggle ao clicar em um item -->
          <b-nav-item @click="toggleNavbar" to="/" exact>Cadastro de Pessoas</b-nav-item>
          <b-nav-item @click="toggleNavbar" to="/presencas">Registro de Presenças</b-nav-item>
          <b-nav-item @click="toggleNavbar" to="/ver-reunioes">Ver Reuniões</b-nav-item>
          <b-nav-item @click="toggleNavbar" to="/relatorio">Relatório de Presença</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- Conteúdo das Rotas -->
    <div class="container mt-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    toggleNavbar() {
      // Simula o clique no botão de toggle
      const toggleButton = this.$refs.navbarToggle.$el; // Acessa o elemento do botão
      toggleButton.click();
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
