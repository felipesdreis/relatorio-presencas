<template>
    <div>
      <h3>Reuniões Existentes</h3>
      <b-table :items="reunioes" :fields="camposReunioes">
        <template #cell(acoes)="data">
          <b-button size="sm" @click="carregarPresencas(data.item.id)"><i class="bi bi-eye-fill"></i></b-button>
          <b-button size="sm" variant="danger" @click="excluirReuniao(data.item.id)"><i class="bi bi-calendar-x"></i></b-button>
        </template>
      </b-table>
  
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
  import { ref, onMounted } from 'vue';
  import { supabase } from '../supabase';
  
  const reunioes = ref([]);
  const pessoas = ref([]);
  const reuniaoSelecionada = ref(null);
  const detalhesReuniao = ref(null);
  
  const camposReunioes = [
    { key: 'data', label: 'Data' },
    { key: 'topico', label: 'Tópico' },
    { key: 'acoes', label: 'Ações' },
  ];
  
  const campos = [
    { key: 'nome', label: 'Nome' },
    { key: 'privilegios', label: 'Privilégios' },
    { key: 'presente', label: 'Presente' },
  ];
  
  // Função para listar reuniões existentes
  const listarReunioes = async () => {
    const { data, error } = await supabase
      .from('reunioes')
      .select('*')
      .order('data', { ascending: false });
  
    if (error) {
      console.error('Erro ao listar reuniões:', error);
      return;
    }
  
    reunioes.value = data;
  };
  
  // Função para carregar presenças de uma reunião
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
  
  // Função para excluir reunião
  const excluirReuniao = async (reuniaoId) => {
    // Confirmar exclusão
    const confirmar = confirm(
      'Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.'
    );
    if (!confirmar) {
      return;
    }
  
    // Deletar presenças associadas à reunião
    const { error: erroDeletePresencas } = await supabase
      .from('presencas')
      .delete()
      .eq('reuniao_id', reuniaoId);
  
    if (erroDeletePresencas) {
      console.error('Erro ao deletar presenças:', erroDeletePresencas);
      alert('Ocorreu um erro ao excluir as presenças da reunião.');
      return;
    }
  
    // Deletar a reunião
    const { error: erroDeleteReuniao } = await supabase
      .from('reunioes')
      .delete()
      .eq('id', reuniaoId);
  
    if (erroDeleteReuniao) {
      console.error('Erro ao deletar reunião:', erroDeleteReuniao);
      alert('Ocorreu um erro ao excluir a reunião.');
      return;
    }
  
    // Atualizar a lista de reuniões
    await listarReunioes();
  
    // Limpar seleção se a reunião excluída estava sendo visualizada
    if (reuniaoSelecionada.value === reuniaoId) {
      reuniaoSelecionada.value = null;
      detalhesReuniao.value = null;
      pessoas.value = [];
    }
  
    alert('Reunião excluída com sucesso!');
  };
  
  onMounted(() => {
    listarReunioes();
  });
  </script>
  
  