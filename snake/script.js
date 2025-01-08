$(document).ready(function() {
    const TAMANHO_TABULEIRO = 400;
    const TAMANHO_SEGMENTO = 20;
    const TAMANHO_GRADE = TAMANHO_TABULEIRO / TAMANHO_SEGMENTO;
    
    let cobra = [];
    let comida = { x: 0, y: 0 };
    let direcao = 'direita';
    let proximaDirecao = 'direita';
    let pontos = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let loopJogo = null;
    let jogoPausado = false;
    let jogoEncerrado = false;
    let audioContext = null;
    
    // Inicializa o contexto de áudio
    function inicializarAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    function playSound(frequency, type = 'sine', duration = 0.1) {
        if (!audioContext) {
            inicializarAudio();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Limpa o tabuleiro completamente
    function limparTabuleiro() {
        $('#tabuleiro').empty();
        criarGrade();
    }
    
    // Cria grade de fundo
    function criarGrade() {
        for (let x = 0; x < TAMANHO_GRADE; x++) {
            for (let y = 0; y < TAMANHO_GRADE; y++) {
                const $cell = $('<div>').addClass('grid-cell').css({
                    left: x * TAMANHO_SEGMENTO + 'px',
                    top: y * TAMANHO_SEGMENTO + 'px'
                });
                $('#tabuleiro').append($cell);
            }
        }
    }
    
    function resetarEstadoJogo() {
        cobra = [];
        direcao = 'direita';
        proximaDirecao = 'direita';
        pontos = 0;
        jogoPausado = false;
        jogoEncerrado = false;
    }
    
    function inicializarCobra() {
        cobra = [
            { x: 6, y: 10 },
            { x: 5, y: 10 },
            { x: 4, y: 10 }
        ];
    }
    
    function gerarComida() {
        while (true) {
            const x = Math.floor(Math.random() * TAMANHO_GRADE);
            const y = Math.floor(Math.random() * TAMANHO_GRADE);
            
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
    
    function desenhar() {
        $('.segmento-cobra, .comida').remove();
        
        cobra.forEach((segmento, indice) => {
            const $segmento = $('<div>').addClass('segmento-cobra').css({
                left: segmento.x * TAMANHO_SEGMENTO + 'px',
                top: segmento.y * TAMANHO_SEGMENTO + 'px'
            });
            
            if (indice === 0) {
                $segmento.addClass('cabeca-cobra');
            } else {
                $segmento.addClass('corpo-cobra');
            }
            
            $('#tabuleiro').append($segmento);
        });
        
        const $comida = $('<div>').addClass('comida').css({
            left: comida.x * TAMANHO_SEGMENTO + 'px',
            top: comida.y * TAMANHO_SEGMENTO + 'px'
        });
        $('#tabuleiro').append($comida);
    }
    
    function atualizar() {
        direcao = proximaDirecao;
        
        const cabeca = { ...cobra[0] };
        switch (direcao) {
            case 'cima': cabeca.y--; break;
            case 'baixo': cabeca.y++; break;
            case 'esquerda': cabeca.x--; break;
            case 'direita': cabeca.x++; break;
        }
        
        if (cabeca.x < 0 || cabeca.x >= TAMANHO_GRADE || 
            cabeca.y < 0 || cabeca.y >= TAMANHO_GRADE) {
            fimDeJogo();
            return;
        }
        
        for (let segmento of cobra) {
            if (cabeca.x === segmento.x && cabeca.y === segmento.y) {
                fimDeJogo();
                return;
            }
        }
        
        cobra.unshift(cabeca);
        
        if (cabeca.x === comida.x && cabeca.y === comida.y) {
            pontos += 10;
            if (pontos > highScore) {
                highScore = pontos;
                localStorage.setItem('snakeHighScore', highScore);
                $('#high-score span').text(highScore);
                playSound(880, 'square', 0.15); // Som de recorde
            } else {
                playSound(660, 'square', 0.1); // Som de comida
            }
            $('#pontuacao span').text(pontos);
            gerarComida();
        } else {
            cobra.pop();
            playSound(440, 'sine', 0.05); // Som de movimento
        }
    }
    
    function fimDeJogo() {
        if (loopJogo) {
            clearInterval(loopJogo);
            loopJogo = null;
        }
        jogoEncerrado = true;
        $('.fim-de-jogo').show();
        playSound(220, 'sawtooth', 0.3); // Som de fim de jogo
    }
    
    function iniciarNovoJogo() {
        if (loopJogo) {
            clearInterval(loopJogo);
            loopJogo = null;
        }
        
        resetarEstadoJogo();
        limparTabuleiro();
        inicializarCobra();
        gerarComida();
        desenhar();
        
        $('#pontuacao span').text('0');
        $('#high-score span').text(highScore);
        $('.fim-de-jogo').hide();
        $('#botao-pausar').text('Pausar');
        
        loopJogo = setInterval(function() {
            if (!jogoPausado && !jogoEncerrado) {
                atualizar();
                desenhar();
            }
        }, 100);
    }
    
    // Event Listeners
    $(document).on('keydown', function(e) {
        if (!jogoPausado && !jogoEncerrado) {
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
        }
    });
    
    $('#botao-iniciar').on('click', function() {
        if (!audioContext) {
            inicializarAudio();
        }
        audioContext.resume().then(() => {
            playSound(440, 'square', 0.1); // Som de início
            iniciarNovoJogo();
        });
    });
    
    $('#botao-pausar').on('click', function() {
        if (!jogoEncerrado) {
            jogoPausado = !jogoPausado;
            $(this).text(jogoPausado ? 'Continuar' : 'Pausar');
            playSound(550, 'sine', 0.1); // Som de pause
        }
    });
    
    // Inicialização
    limparTabuleiro();
    inicializarCobra();
    gerarComida();
    desenhar();
    $('#high-score span').text(highScore);
});