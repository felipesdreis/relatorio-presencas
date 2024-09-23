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
    <b-button @click="gerarRelatorioFaltas">Gerar Relatório Faltas</b-button>

    <!-- relatorio presença reuniões -->
    <div v-if="relatorio.length > 0">
      <b-table :items="relatorio" :fields="camposRelatorio"></b-table>
    </div>
    <!-- relatorio de faltas (grafico) -->
    <div v-if="chartData.labels.length">
      <BarChart :chart-data="chartData" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase';
import BarChart from '@/components/BarChart.vue';

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

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Número de Faltas',
    backgroundColor: '#42A5F5',
    data: []
  }]
});

const gerarRelatorioFaltas = async () => {
  if (!dataInicial.value || !dataFinal.value) {
    alert('Selecione o intervalo de datas.');
    return;
  }


  const { data: resultados, error } = await supabase
    .rpc('get_faltas_por_periodo', { data_inicial: dataInicial.value, data_final: dataFinal.value });

  if (error) {
    console.error('Erro ao gerar relatório de faltas:', error);
    return;
  }

  // Preparar dados para o gráfico
  chartData.value.labels = resultados.map(item => item.nome);
  chartData.value.datasets[0].data = resultados.map(item => item.faltas);
};

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

  console.log(resultados)

  // Preparar dados para a tabela
  relatorio.value = resultados.map(item => ({
    nome: item.pessoas.nome,
    data: item.reunioes.data,
    topico: item.reunioes.topico
  }));
};
</script>

