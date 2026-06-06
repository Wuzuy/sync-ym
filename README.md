# Sync YM

Um minigame interativo e cooperativo em tempo real para duas pessoas, desenvolvido com React, Vite, Tailwind CSS e Supabase Realtime. Atualmente está para duas pessoas (Luca e Mimi)

## Visão Geral

Este projeto é uma experiência digital cooperativa onde dois jogadores devem se conectar em uma mesma sessão e resolver uma série de desafios assimétricos. A comunicação entre os clientes ocorre via WebSockets (Supabase Realtime), garantindo que as ações de um jogador reflitam imediatamente na tela do outro.

## Tecnologias Utilizadas

- **React 18** (com Vite)
- **TypeScript**
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Supabase Realtime** para sincronização de estado e eventos via WebSockets
- **React Router DOM** para navegação

## Estrutura Principal

A arquitetura do projeto foca na separação entre os componentes visuais dos puzzles e a lógica de sincronização:

- `src/context/`: Contém o Provider (`RealtimeContext.tsx`) que gerencia a conexão com o Supabase e o estado global da partida, propagando eventos para os dois clientes de forma síncrona.
- `src/components/puzzles/`: Contém os componentes de cada desafio. A lógica interna depende frequentemente da flag `isHost` para renderizar a interface de quem "Cria a Sala" (Luca) ou de quem "Entra na Sala" (Mimi).
- `src/lib/puzzleRandom.ts`: Módulo focado na geração determinística (através de um *seed* único da sessão) de elementos aleatórios para os puzzles, garantindo que ambos os jogadores tenham as mesmas variáveis durante a partida, sem precisarem trafegar todos os dados pelo WebSocket.

## Como Executar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseadas no serviço do Supabase:
   - Crie um arquivo `.env` na raiz do projeto com as chaves:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy (GitHub Pages)

Para fazer o deploy para o GitHub Pages:
1. Certifique-se de que a configuração `base` no `vite.config.ts` aponta para o nome do repositório (ex: `/sync-ym/`).
2. Execute o comando de deploy (configurado via pacote `gh-pages`):
   ```bash
   npm run deploy
   ```