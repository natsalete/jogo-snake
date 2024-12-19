$(document).ready(function() {
  const TAMANHO_TABULEIRO = 400;
  const TAMANHO_SEGMENTO = 20;
  const TAMANHO_GRADE = TAMANHO_TABULEIRO / TAMANHO_SEGMENTO;
  
  let cobra = [];
  let comida = { x: 0, y: 0 };
  let direcao = 'direita';
  let proximaDirecao = 'direita';
  let pontos = 0;
  let loopJogo;
  let jogoPausado = false;
  let jogoEncerrado = false;
  
  // Inicializa a cobra
  function inicializarCobra() {
      cobra = [
          { x: 6, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 10 }
      ];
  }
  
  // Gera comida em posição aleatória
  function gerarComida() {
      while (true) {
          const x = Math.floor(Math.random() * TAMANHO_GRADE);
          const y = Math.floor(Math.random() * TAMANHO_GRADE);
          
          // Verifica se a posição está livre
          let posicaoValida = true;
          for (let segmento of cobra) {
              if (segmento.x === x && segmento.y === y) {
                  posicaoValida = false;
                  break;
              }
          }
          
          if (posicaoValida) {
              comida = { x, y };
              break;
          }
      }
  }
  
  // Desenha o jogo
  function desenhar() {
      $('#tabuleiro').empty();
      
      // Desenha a cobra
      cobra.forEach((segmento, indice) => {
          const $segmento = $('<div>').addClass('segmento-cobra').css({
              left: segmento.x * TAMANHO_SEGMENTO + 'px',
              top: segmento.y * TAMANHO_SEGMENTO + 'px'
          });
          if (indice === 0) {
              $segmento.css('background-color', '#388E3C');
          }
          $('#tabuleiro').append($segmento);
      });
      
      // Desenha a comida
      const $comida = $('<div>').addClass('comida').css({
          left: comida.x * TAMANHO_SEGMENTO + 'px',
          top: comida.y * TAMANHO_SEGMENTO + 'px'
      });
      $('#tabuleiro').append($comida);
  }
  
  // Atualiza o estado do jogo
  function atualizar() {
      direcao = proximaDirecao;
      
      // Calcula nova posição da cabeça
      const cabeca = { ...cobra[0] };
      switch (direcao) {
          case 'cima': cabeca.y--; break;
          case 'baixo': cabeca.y++; break;
          case 'esquerda': cabeca.x--; break;
          case 'direita': cabeca.x++; break;
      }
      
      // Verifica colisão com paredes
      if (cabeca.x < 0 || cabeca.x >= TAMANHO_GRADE || cabeca.y < 0 || cabeca.y >= TAMANHO_GRADE) {
          fimDeJogo();
          return;
      }
      
      // Verifica colisão com próprio corpo
      for (let segmento of cobra) {
          if (cabeca.x === segmento.x && cabeca.y === segmento.y) {
              fimDeJogo();
              return;
          }
      }
      
      // Adiciona nova cabeça
      cobra.unshift(cabeca);
      
      // Verifica se comeu a comida
      if (cabeca.x === comida.x && cabeca.y === comida.y) {
          pontos += 10;
          $('#pontuacao span').text(pontos);
          gerarComida();
      } else {
          cobra.pop();
      }
  }
  
  // Fim de Jogo
  function fimDeJogo() {
      clearInterval(loopJogo);
      jogoEncerrado = true;
      $('.fim-de-jogo').show();
  }
  
  // Controles do teclado
  $(document).on('keydown', function(e) {
      switch (e.key) {
          case 'ArrowUp':
              if (direcao !== 'baixo') proximaDirecao = 'cima';
              break;
          case 'ArrowDown':
              if (direcao !== 'cima') proximaDirecao = 'baixo';
              break;
          case 'ArrowLeft':
              if (direcao !== 'direita') proximaDirecao = 'esquerda';
              break;
          case 'ArrowRight':
              if (direcao !== 'esquerda') proximaDirecao = 'direita';
              break;
      }
  });
  
  // Iniciar jogo
  $('#botao-iniciar').on('click', function() {
      clearInterval(loopJogo);
      jogoEncerrado = false;
      jogoPausado = false;
      pontos = 0;
      $('#pontuacao span').text(pontos);
      $('.fim-de-jogo').hide();
      inicializarCobra();
      gerarComida();
      loopJogo = setInterval(function() {
          if (!jogoPausado) {
              atualizar();
              desenhar();
          }
      }, 100);
  });
  
  // Pausar/Continuar
  $('#botao-pausar').on('click', function() {
      if (!jogoEncerrado) {
          jogoPausado = !jogoPausado;
          $(this).text(jogoPausado ? 'Continuar' : 'Pausar');
      }
  });
  
  // Primeira inicialização
  inicializarCobra();
  gerarComida();
  desenhar();
});