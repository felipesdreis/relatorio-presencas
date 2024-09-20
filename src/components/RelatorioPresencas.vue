<template>
  <div>
    <b-form-group label="Data Inicial">
      <b-form-input type="date" v-model="dataInicial"></b-form-input>
    </b-form-group>
    <b-form-group label="Data Final">
      <b-form-input type="date" v-model="dataFinal"></b-form-input>
    </b-form-group>

    <b-form-group label="Tópico da Reunião">
      <b-form-select v-model="topicoReuniao" :options="opcoesTopicos"></b-form-select>
    </b-form-group>

    <b-button @click="gerarRelatorio">Gerar Relatório</b-button>

    <div v-if="relatorio.length > 0">
      <b-table :items="relatorio" :fields="camposRelatorio"></b-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase';

const dataInicial = ref(null);
const dataFinal = ref(null);
const topicoReuniao = ref(null);
const relatorio = ref([]);
const camposRelatorio = [
  { key: 'nome', label: 'Nome' },
  { key: 'data', label: 'Data' },
  { key: 'topico', label: 'Tópico' }
];

const opcoesTopicos = [
  { value: null, text: 'Todos os tópicos' },
  { value: 'Reunião de semana', text: 'Reunião de semana' },
  { value: 'Reunião de fim de semana', text: 'Reunião de fim de semana' },
  { value: 'Reunião especial', text: 'Reunião especial' }
];

const gerarRelatorio = async () => {
  if (!dataInicial.value || !dataFinal.value) {
    alert('Selecione o intervalo de datas.');
    return;
  }

  // Buscar os IDs das reuniões no intervalo de datas e tópico selecionado
  let reuniaoQuery = supabase
    .from('reunioes')
    .select('id')
    .gte('data', dataInicial.value)
    .lte('data', dataFinal.value);

  if (topicoReuniao.value) {
    reuniaoQuery = reuniaoQuery.eq('topico', topicoReuniao.value);
  }

  const { data: reunioes, error: erroReunioes } = await reuniaoQuery;

  if (erroReunioes) {
    console.error('Erro ao buscar reuniões:', erroReunioes);
    return;
  }

  const reuniaoIds = reunioes.map(reuniao => reuniao.id);

  if (reuniaoIds.length === 0) {
    alert('Nenhuma reunião encontrada no intervalo de datas selecionado.');
    return;
  }

  // Buscar as presenças das reuniões obtidas
  const { data: resultados, error } = await supabase
    .from('presencas')
    .select(`
      pessoa_id,
      presente,
      reunioes ( data, topico ),
      pessoas ( nome )
    `)
    .eq('presente', true)
    .in('reuniao_id', reuniaoIds);

  if (error) {
    console.error('Erro ao gerar relatório:', error);
    return;
  }

  // Preparar dados para a tabela
  relatorio.value = resultados.map(item => ({
    nome: item.pessoas.nome,
    data: item.reunioes.data,
    topico: item.reunioes.topico
  }));
};
</script>
