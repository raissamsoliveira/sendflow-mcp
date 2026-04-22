# sendflow-mcp

Servidor MCP local em Node.js para integrar a [SendAPI do Sendflow](https://sendflow.pro/sendapi) ao [Claude Code](https://claude.ai/code).

Após configurado, você interage com toda a API do Sendflow em linguagem natural diretamente no terminal — sem escrever código, sem montar requisições HTTP na mão.

```
"Liste minhas campanhas e me diga qual teve mais cliques"
"Agende uma mensagem para o grupo X às 18h de hoje"
"Bloqueie o número 5511999999999 como Spammer"
```

---

## Ferramentas disponíveis (41)

| Categoria | Ferramentas |
|---|---|
| Campanhas | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `delete_campaign`, `update_campaign_redirect_link`, `get_campaign_groups`, `get_campaign_analytics`, `generate_campaign_leadscoring`, `get_campaign_leadscoring_url` |
| Grupos de Campanhas | `get_release_group`, `add_release_group`, `update_release_group`, `delete_release_group` |
| Envio para Grupos | `create_whatsapp_group`, `make_group_admin`, `send_text_to_campaign`, `send_image_to_campaign`, `send_video_to_campaign`, `send_audio_to_campaign`, `send_message_universal`, `analyze_groups`, `find_participant` |
| Mensagens Diretas | `send_direct_text`, `send_direct_image`, `send_direct_video`, `send_direct_audio` |
| Templates | `list_templates`, `create_template`, `update_template`, `delete_template` |
| Contas | `list_accounts`, `create_account`, `update_account`, `delete_account`, `connect_account`, `disconnect_account`, `get_account_qrcode` |
| Números Bloqueados | `list_blocked_numbers`, `block_number` |
| Verificação | `verify_number` |

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [Claude Code](https://claude.ai/code) instalado (`npm install -g @anthropic-ai/claude-code`)
- [Git for Windows](https://git-scm.com) (apenas Windows) com a variável `CLAUDE_CODE_GIT_BASH_PATH` definida
- API Key do Sendflow (formato `send_api-...`)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sendflow-mcp.git
cd sendflow-mcp
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Registre o servidor no Claude Code

```bash
# Windows (PowerShell — rode dentro da pasta sendflow-mcp)
claude mcp add sendflow --scope user --env SENDFLOW_API_KEY=sua_api_key_aqui -- node "%CD%\index.js"

# macOS / Linux
claude mcp add sendflow --scope user --env SENDFLOW_API_KEY=sua_api_key_aqui -- node "$(pwd)/index.js"
```

### 4. Confirme o registro

```bash
claude mcp list
# sendflow   node /caminho/para/index.js
```

### 5. Use

Abra o Claude Code e peça qualquer coisa em linguagem natural:

```bash
claude
> Liste minhas campanhas
> Qual campanha teve mais cliques essa semana?
> Envie "Promoção relâmpago 🔥" para todos os grupos da campanha X
```

---

## Configuração alternativa — Claude Desktop

Adicione ao arquivo `claude_desktop_config.json`:

**Windows:** `C:\Users\SEU_USUARIO\AppData\Roaming\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sendflow": {
      "command": "node",
      "args": ["C:\\caminho\\para\\sendflow-mcp\\index.js"],
      "env": {
        "SENDFLOW_API_KEY": "send_api-sua_chave_aqui"
      }
    }
  }
}
```

> ⚠️ No Windows, use barras duplas `\\` nos caminhos dentro do JSON.

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `SENDFLOW_API_KEY` | API Key do Sendflow. Formato: `send_api-...` |

Copie `.env.example` para `.env` para testes locais (opcional — o Claude Code lê via `--env`).

---

## Exemplos de uso

```
# Analytics
"Me mostra o analytics das minhas últimas 3 campanhas e qual teve mais cliques"

# Agendamento
"Agende uma mensagem 'Promoção relâmpago' para a campanha X às 18h de hoje"

# Verificação
"Verifique se os números 11999999999 e 11888888888 estão bloqueados"

# Bloqueio
"Bloqueie o número 5511999999999 como Spammer e confirme"

# QR Code
"Me mostra o QR code da conta ACC123 para reconectar o WhatsApp"

# Criação
"Crie uma campanha 'Black Friday 2026' e adicione o grupo 120363...@g.us nela"
```

---

## Solução de problemas

| Erro | Causa | Solução |
|---|---|---|
| `SENDFLOW_API_KEY não definida` | Chave não passou no `--env` | Confirme o parâmetro `--env SENDFLOW_API_KEY=...` no `claude mcp add` |
| `401 Unauthorized` | API Key inválida ou expirada | Gere uma nova chave no painel do Sendflow |
| `MCP server sendflow already exists` | Servidor já registrado | Rode `claude mcp remove sendflow` e registre novamente |
| `claude não é reconhecido` | npm global fora do PATH | Execute `npm config get prefix` e adicione ao PATH |
| `ERR_MODULE_NOT_FOUND` ou `zod/v4` | SDK incompatível com Node 22 | Confirme `"@modelcontextprotocol/sdk": "^1.9.0"` no `package.json` e rode `npm install` |
| `Claude Code on Windows requires git-bash` | Git não instalado | Instale o [Git for Windows](https://git-scm.com) e defina `CLAUDE_CODE_GIT_BASH_PATH` |

---

## Estrutura do projeto

```
sendflow-mcp/
├── index.js          # Servidor MCP — 41 ferramentas
├── package.json      # Dependências (SDK ^1.9.0)
├── .env.example      # Modelo de variáveis de ambiente
├── .gitignore
├── SETUP.md          # Guia de instalação detalhado
└── tutorial.pdf      # Tutorial completo (Node.js + MCP + SendAPI)
```

---

## Licença

MIT
