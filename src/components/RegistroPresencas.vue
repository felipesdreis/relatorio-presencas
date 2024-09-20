<template>
  <div>
    <!-- Formulário para Criar Nova Reunião -->
    <h3>Criar Nova Reunião</h3>
    <b-form-group label="Data da Reunião">
      <b-form-input type="date" v-model="dataReuniao" :max="hoje"></b-form-input>
    </b-form-group>

    <b-form-group label="Tópico da Reunião">
      <b-form-select v-model="topicoReuniao" :options="opcoesTopicos"></b-form-select>
    </b-form-group>

    <b-button @click="criarECarregarPresencas">Criar Reunião e Carregar Presenças</b-button>

    <!-- Tabela de Presenças -->
    <div v-if="pessoas.length > 0">
      <h3>Presenças da Reunião</h3>
      <p><strong>Data:</strong> {{ detalhesReuniao.data }}</p>
      <p><strong>Tópico:</strong> {{ detalhesReuniao.topico }}</p>

      <b-table :items="pessoas" :fields="campos">
        <template #cell(presente)="data">
          <b-form-checkbox v-model="data.item.presente"></b-form-checkbox>
        </template>
      </b-table>

      <b-button variant="primary" @click="salvarPresencas">Salvar Presenças</b-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase';

const hoje = new Date().toISOString().split('T')[0];
const pessoas = ref([]);
const reuniaoSelecionada = ref(null);
const dataReuniao = ref(null);
const topicoReuniao = ref(null);
const detalhesReuniao = ref(null);

const campos = [
  { key: 'nome', label: 'Nome' },
  { key: 'privilegios', label: 'Privilégios' },
  { key: 'presente', label: 'Presente' },
];

const opcoesTopicos = [
  { value: null, text: 'Selecione o tópico' },
  { value: 'Reunião de semana', text: 'Reunião de semana' },
  { value: 'Reunião de fim de semana', text: 'Reunião de fim de semana' },
  { value: 'Reunião especial', text: 'Reunião especial' },
];

// Função para criar uma nova reunião e carregar as presenças
const criarECarregarPresencas = async () => {
  if (!dataReuniao.value) {
    alert('Selecione uma data.');
    return;
  }

  if (!topicoReuniao.value) {
    alert('Selecione o tópico da reunião.');
    return;
  }

  // Verificar se a reunião já existe
  let { data: reuniaoExistente, error: erroReuniao } = await supabase
    .from('reunioes')
    .select('*')
    .eq('data', dataReuniao.value)
    .eq('topico', topicoReuniao.value)
    .single();

  if (erroReuniao && erroReuniao.code !== 'PGRST116') {
    console.error('Erro ao verificar reunião:', erroReuniao);
    return;
  }

  if (reuniaoExistente) {
    alert('Esta reunião já existe. Por favor, vá para "Ver Reuniões" para editá-la.');
    return;
  } else {
    // Criar nova reunião
    let { data: novaReuniao, error: erroNovaReuniao } = await supabase
      .from('reunioes')
      .insert([{ data: dataReuniao.value, topico: topicoReuniao.value }])
      .select()
      .single();

    if (erroNovaReuniao) {
      console.error('Erro ao criar reunião:', erroNovaReuniao);
      return;
    }

    if (!novaReuniao) {
      console.error('Não foi possível obter os dados da nova reunião.');
      return;
    }

    // Carregar presenças
    await carregarPresencas(novaReuniao.id);

    // Limpar campos de entrada
    dataReuniao.value = null;
    topicoReuniao.value = null;
  }
};

// Função para carregar as presenças de uma reunião
const carregarPresencas = async (reuniaoId) => {
  reuniaoSelecionada.value = reuniaoId;

  // Obter dados da reunião selecionada
  const { data: reuniaoData, error: erroReuniao } = await supabase
    .from('reunioes')
    .select('*')
    .eq('id', reuniaoId)
    .single();

  if (erroReuniao) {
    console.error('Erro ao obter dados da reunião:', erroReuniao);
    return;
  }

  // Armazenar os detalhes da reunião
  detalhesReuniao.value = reuniaoData;

  // Carregar pessoas
  const { data: listaPessoas, error: erroPessoas } = await supabase
    .from('pessoas')
    .select('*');

  if (erroPessoas) {
    console.error('Erro ao carregar pessoas:', erroPessoas);
    return;
  }

  // Carregar presenças
  const { data: presencasExistentes, error: erroPresencas } = await supabase
    .from('presencas')
    .select('*')
    .eq('reuniao_id', reuniaoId);

  if (erroPresencas) {
    console.error('Erro ao carregar presenças:', erroPresencas);
    return;
  }

  // Mapear presenças
  const presencasMap = {};
  presencasExistentes.forEach((presenca) => {
    presencasMap[presenca.pessoa_id] = presenca.presente;
  });

  // Combinar pessoas com presenças
  pessoas.value = listaPessoas.map((pessoa) => ({
    ...pessoa,
    reuniao_id: reuniaoId,
    presente:
      presencasMap[pessoa.id] !== undefined ? presencasMap[pessoa.id] : false,
  }));
};

// Função para salvar presenças
const salvarPresencas = async () => {
  if (!pessoas.value.length) {
    alert('Nenhuma presença para salvar.');
    return;
  }

  const updates = pessoas.value.map((pessoa) => ({
    pessoa_id: pessoa.id,
    reuniao_id: pessoa.reuniao_id,
    presente: pessoa.presente,
  }));

  // Deletar presenças existentes para a reunião
  const { error: erroDelete } = await supabase
    .from('presencas')
    .delete()
    .eq('reuniao_id', pessoas.value[0].reuniao_id);

  if (erroDelete) {
    console.error('Erro ao deletar presenças:', erroDelete);
    return;
  }

  // Inserir presenças atualizadas
  const { error: erroInsert } = await supabase
    .from('presencas')
    .insert(updates);

  if (erroInsert) {
    console.error('Erro ao salvar presenças:', erroInsert);
    return;
  }

  alert('Presenças salvas com sucesso!');
};
</script>
