// router.js

import { createRouter, createWebHistory } from 'vue-router';
import CadastroPessoas from './components/CadastroPessoas.vue';
import RegistroPresencas from './components/RegistroPresencas.vue';
import RelatorioPresencas from './components/RelatorioPresencas.vue';
import VerReunioes from './components/VerReunioes.vue';

const routes = [
  { path: '/', name: 'Home', component: CadastroPessoas },
  { path: '/presencas', name: 'Presencas', component: RegistroPresencas },
  { path: '/ver-reunioes', name: 'VerReunioes', component: VerReunioes },
  { path: '/relatorio', name: 'Relatorio', component: RelatorioPresencas },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
