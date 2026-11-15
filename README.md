# The Unknown — O Segredo Além do Jardim

Este é um projeto de estudo de Front-End sobre a série *O Segredo Além do Jardim*. Fiz a página para praticar HTML, CSS e JavaScript e para testar como carregar dados de uma API.

## Como abrir

1. Baixe ou clone este projeto.
2. Abra a pasta no VS Code.
3. Inicie um servidor local, por exemplo com a extensão **Live Server**.
4. Abra o endereço que o servidor mostrar.

É melhor usar um servidor local do que abrir o `index.html` direto com `file://`, porque o navegador pode bloquear algumas requisições.

## O que dá para fazer

- Ver informações da série e do elenco carregadas da TVmaze.
- Procurar personagens pelo nome ou pelo intérprete.
- Filtrar a lista para mostrar personagens com ou sem imagem.
- Usar a página no celular ou no computador.
- Ver mensagens enquanto os dados carregam ou se acontecer algum erro.

## O que pratiquei

- Fazer requisições com `fetch()` e tratar erros da API.
- Criar elementos HTML pelo JavaScript com `document.createElement()`.
- Atualizar a lista quando a pessoa pesquisa ou troca o filtro.
- Organizar o layout com CSS responsivo.

## API e referências

- [API da TVmaze](https://www.tvmaze.com/api)
- [Ficha de O Segredo Além do Jardim](https://www.tvmaze.com/shows/1744/over-the-garden-wall)
- Endpoints usados: `https://api.tvmaze.com/shows/1744` e `https://api.tvmaze.com/shows/1744/cast`

Os dados são da TVmaze e são usados com atribuição, conforme a licença CC BY-SA indicada na [documentação da API](https://www.tvmaze.com/api#licensing). A aplicação faz duas consultas quando a página abre; se a API estiver indisponível, aparece uma mensagem para tentar novamente mais tarde.

## Arquivos

- `index.html` — conteúdo e estrutura da página.
- `style.css` — cores, layout e ajustes para telas menores.
- `script.js` — consultas à API, cards e filtros.
