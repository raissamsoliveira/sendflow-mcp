# Sendflow MCP — Guia de Instalação

Servidor MCP local (Node.js) para integrar a API do Sendflow ao Claude.
Após configurado, você pode pedir ao Claude coisas como:
_"Liste minhas campanhas"_, _"Mostre os analytics da campanha X"_, _"Envie uma mensagem agendada para amanhã às 10h"_.

**41 ferramentas** cobrindo todos os endpoints da SendAPI.

---

## Pré-requisitos

- **Node.js 18+** instalado ([nodejs.org](https://nodejs.org))
- **API Key do Sendflow** (formato `send_api-...`)
- **Claude Desktop** ou **Claude Code** instalado

---

## 1. Instalar dependências

Abra o terminal nesta pasta e rode:

```bash
cd "C:\Users\raiss\Desktop\sendapi"
npm install
```

---

## 2. Testar o servidor manualmente

```bash
# Windows (PowerShell)
$env:SENDFLOW_API_KEY="sua_api_key_aqui"; node index.js

# macOS/Linux
SENDFLOW_API_KEY=sua_api_key_aqui node index.js
```

Se aparecer `[sendflow-mcp] Servidor MCP v2.0.0 rodando (41 ferramentas)`, está funcionando.
Pressione `Ctrl+C` para encerrar.

---

## Opção A — Registrar no Claude Desktop

Abra o arquivo de configuração:

**Windows:** `C:\Users\raiss\AppData\Roaming\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Adicione (ou inclua dentro do bloco `mcpServers` existente):

```json
{
  "mcpServers": {
    "sendflow": {
      "command": "node",
      "args": [
        "C:\\Users\\raiss\\Desktop\\sendapi\\index.js"
      ],
      "env": {
        "SENDFLOW_API_KEY": "send_api-6o73ag9guyghkyub4wz8hqnwr9cbpcaj0sgceqc7"
      }
    }
  }
}
```

> ⚠️ **Atenção:** No Windows, use barras duplas `\\` nos caminhos dentro do JSON.

Reinicie o Claude Desktop. O servidor aparecerá automaticamente como integração disponível.

---

## Opção B — Registrar no Claude Code (VS Code)

Se você usa o Claude Code no terminal do VS Code, registre com:

```bash
# Windows (dentro da pasta sendapi)
claude mcp add sendflow --env SENDFLOW_API_KEY=send_api-SUA_KEY -- node "%CD%\index.js"

# Para disponibilizar em qualquer pasta (escopo global):
claude mcp add sendflow --scope user --env SENDFLOW_API_KEY=send_api-SUA_KEY -- node "C:\Users\raiss\Desktop\sendapi\index.js"
```

Confirme que foi adicionado:
```bash
claude mcp list
```

Deve aparecer `sendflow` na lista.

---

## Ferramentas disponíveis (41)

### Campanhas (10)
| Ferramenta | Descrição |
|---|---|
| `list_campaigns` | Lista todas as campanhas |
| `get_campaign` | Detalhes de uma campanha |
| `create_campaign` | Cria nova campanha |
| `update_campaign` | Atualiza campanha existente |
| `delete_campaign` | Remove campanha (irreversível) |
| `update_campaign_redirect_link` | Altera o slug do link de redirect |
| `get_campaign_groups` | Grupos vinculados à campanha |
| `get_campaign_analytics` | Métricas de adds, removes e clicks |
| `generate_campaign_leadscoring` | Dispara geração do leadscoring |
| `get_campaign_leadscoring_url` | URL do arquivo de leadscoring (.xlsx) |

### Grupos de Campanhas (4)
| Ferramenta | Descrição |
|---|---|
| `get_release_group` | Detalhes de um grupo de campanha |
| `add_release_group` | Vincula grupo a uma campanha |
| `update_release_group` | Atualiza dados do grupo |
| `delete_release_group` | Remove grupo da campanha |

### Ações — Envio para Grupos (9)
| Ferramenta | Descrição |
|---|---|
| `create_whatsapp_group` | Cria novo grupo no WhatsApp |
| `make_group_admin` | Torna usuários administradores |
| `send_text_to_campaign` | Envia texto para grupos da campanha |
| `send_image_to_campaign` | Envia imagem para grupos da campanha |
| `send_video_to_campaign` | Envia vídeo para grupos da campanha |
| `send_audio_to_campaign` | Envia áudio para grupos da campanha |
| `send_message_universal` | Envia qualquer tipo com configurações avançadas |
| `analyze_groups` | Dispara análise anti-spam |
| `find_participant` | Verifica se número está em algum grupo |

### Mensagens Diretas (4)
| Ferramenta | Descrição |
|---|---|
| `send_direct_text` | Envia texto direto para um número |
| `send_direct_image` | Envia imagem direta para um número |
| `send_direct_video` | Envia vídeo direto para um número |
| `send_direct_audio` | Envia áudio direto para um número |

### Templates (4)
| Ferramenta | Descrição |
|---|---|
| `list_templates` | Lista templates de mensagem |
| `create_template` | Cria novo template |
| `update_template` | Atualiza template existente |
| `delete_template` | Remove template |

### Contas (7)
| Ferramenta | Descrição |
|---|---|
| `list_accounts` | Lista contas WhatsApp/Email |
| `create_account` | Cria nova conta |
| `update_account` | Atualiza conta existente |
| `delete_account` | Remove conta (irreversível) |
| `connect_account` | Inicia conexão e gera QR code |
| `disconnect_account` | Desconecta conta |
| `get_account_qrcode` | Obtém QR code e status da conta |

### Números Bloqueados (2)
| Ferramenta | Descrição |
|---|---|
| `list_blocked_numbers` | Lista números bloqueados |
| `block_number` | Bloqueia um número |

### Verificação (1)
| Ferramenta | Descrição |
|---|---|
| `verify_number` | Verifica se número pode receber mensagens |

---

## Exemplos de uso em linguagem natural

- _"Me mostra o analytics das minhas últimas 3 campanhas e qual teve mais cliques."_
- _"Agende uma mensagem 'Promoção relâmpago' para a campanha X às 18h de hoje com shippingSpeed normal."_
- _"Verifique se os números 11999999999 e 11888888888 estão bloqueados para a campanha X."_
- _"Bloqueie o número 5511999999999 como 'Spammer' e confirme."_
- _"Me mostra o QR code da conta ACC123 para eu reconectar o WhatsApp."_
- _"Crie uma campanha 'Black Friday 2026' e adicione o grupo 120363292004848696@g.us nela."_

---

## Solução de problemas

**Erro: `SENDFLOW_API_KEY não definida`**
→ Verifique se a chave está corretamente configurada na configuração.

**Erro: `401 Unauthorized`**
→ API Key inválida ou expirada. Gere uma nova no painel do Sendflow.

**Servidor não aparece no Claude**
→ Verifique se o JSON de configuração está válido ([jsonlint.com](https://jsonlint.com)) e reinicie o Claude Desktop.

**`claude mcp add` — servidor já existe**
→ Rode `claude mcp remove sendflow` e adicione novamente.

**Node não encontrado**
→ Verifique: `node --version`. Se não estiver instalado: [nodejs.org](https://nodejs.org).
