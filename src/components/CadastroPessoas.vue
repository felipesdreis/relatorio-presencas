<template>
  <div>
    <b-button @click="mostrarFormulario = true">Adicionar Pessoa</b-button>

    <b-modal v-model="mostrarFormulario" :title="pessoa.id ? 'Editar Pessoa' : 'Adicionar Pessoa'" :footer="false">
      <!-- Formulário de Cadastro -->
      <b-form @submit.prevent="salvarPessoa">
        <b-form-group label="Nome">
          <b-form-input v-model="pessoa.nome" required></b-form-input>
        </b-form-group>
        <b-form-group label="Privilégios">
          <b-form-select v-model="pessoa.privilegios" :options="opcoesPrivilegios"></b-form-select>
        </b-form-group>
        <div class="btn-group" role="group" aria-label="Basic example">
          <b-button type="submit" variant="primary"><i class="bi bi-floppy-fill"></i></b-button>
          <b-button @click="cancelarEdicao"><i class="bi bi-x-octagon"></i></b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- Tabela de Pessoas -->
    <b-table :items="pessoas" :fields="campos">
      <template #cell(acoes)="data">
        <b-button size="sm" @click="editarPessoa(data.item)"><i class="bi bi-pencil-fill"></i></b-button>
        <b-button size="sm" variant="danger" @click="excluirPessoa(data.item.id)"><i
            class="bi bi-trash3-fill"></i></b-button>
      </template>
    </b-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';

const mostrarFormulario = ref(false);
const pessoas = ref([]);
const pessoa = ref({
  id: null,
  nome: '',
  privilegios: ''
});
const campos = [
  { key: 'nome', label: 'Nome' },
  { key: 'privilegios', label: 'Privilégios' },
  { key: 'acoes', label: 'Ações' }
];
const opcoesPrivilegios = [
  { value: null, text: 'Selecione um privilégio' },
  { value: 'Ancião', text: 'Ancião' },
  { value: 'Servo Ministerial', text: 'Servo Ministerial' },
  { value: 'Pioneiro', text: 'Pioneiro' },
  { value: 'Publicador', text: 'Publicador' },
  { value: 'Publicador não batizado', text: 'Publicador não batizado' }
];

const listarPessoas = async () => {
  const { data: listaPessoas, error } = await supabase
    .from('pessoas')
    .select('*')
    .order('privilegios');
  if (error) console.error('Erro', error);
  else pessoas.value = listaPessoas;
};

const salvarPessoa = async () => {
  if (pessoa.value.id) {
    // Atualizar pessoa existente
    const { error } = await supabase
      .from('pessoas')
      .update({
        nome: pessoa.value.nome,
        privilegios: pessoa.value.privilegios
      })
      .eq('id', pessoa.value.id);
    if (error) console.error('Erro', error);
  } else {
    // Adicionar nova pessoa
    const { error } = await supabase
      .from('pessoas')
      .insert([
        {
          nome: pessoa.value.nome,
          privilegios: pessoa.value.privilegios
        }
      ]);
    if (error) console.error('Erro', error);
  }
  mostrarFormulario.value = false;
  limparFormulario();
  listarPessoas();
};

const editarPessoa = (pessoaSelecionada) => {
  pessoa.value = { ...pessoaSelecionada };
  mostrarFormulario.value = true;
};

const excluirPessoa = async (id) => {
  const { error } = await supabase
    .from('pessoas')
    .delete()
    .eq('id', id);
  if (error) console.error('Erro', error);
  listarPessoas();
};

const cancelarEdicao = () => {
  mostrarFormulario.value = false;
  limparFormulario();
};

const limparFormulario = () => {
  pessoa.value = {
    id: null,
    nome: '',
    privilegios: ''
  };
};

// ação assim que inicia a tela
onMounted(() => {
  listarPessoas();
});
</script>