<template>
    <Bar :data="chartData" :options="chartOptions" />
</template>
  
  <script>
  import { defineComponent } from 'vue';
  import { Bar } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  } from 'chart.js';
  
  // Registrar componentes do Chart.js
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
  
  export default defineComponent({
    name: 'BarChart',
    props: {
      chartData: {
        type: Object,
        required: true
      }
    },
    components: {
      Bar
    },
    setup() {
      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Relatório de Faltas por Pessoa'
          }
        }
      };
  
      return {
        chartOptions
      };
    }
  });
  </script>
  
  <style scoped>
  /* Adicione estilos customizados, se necessário */
  </style>
  