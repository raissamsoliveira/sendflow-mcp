#!/usr/bin/env node
/**
 * Sendflow MCP Server — 41 ferramentas
 * Servidor MCP local para integração com a API do Sendflow.
 *
 * Uso: SENDFLOW_API_KEY=sua_chave node index.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = process.env.SENDFLOW_API_KEY;
const BASE_URL = "https://sendflow.pro/sendapi";

if (!API_KEY) {
  console.error("[sendflow-mcp] ERRO: variável de ambiente SENDFLOW_API_KEY não definida.");
  process.exit(1);
}

// ─── Helper HTTP ──────────────────────────────────────────────────────────────

async function callAPI(method, path, body = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (err) {
    return { ok: false, status: 0, data: { error: `Falha de rede: ${err.message}` } };
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { ok: response.ok, status: response.status, data };
}

function toResult(result) {
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    isError: !result.ok,
  };
}

// ─── Definição das 41 ferramentas ─────────────────────────────────────────────

const TOOLS = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. CAMPANHAS — 10 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "list_campaigns",
    description: "Lista todas as campanhas (releases) do usuário autenticado no Sendflow.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_campaign",
    description: "Retorna detalhes completos de uma campanha específica.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "create_campaign",
    description: "Cria uma nova campanha no Sendflow.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome da campanha" },
        type: {
          type: "string",
          enum: ["WhatsRelease", "WhatsList", "WhatsViralCampaign"],
          description: "Tipo da campanha",
        },
        projectId: { type: "string", description: "ID do projeto (opcional)" },
      },
      required: ["name", "type"],
    },
  },
  {
    name: "update_campaign",
    description: "Atualiza dados de uma campanha existente.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
        name: { type: "string", description: "Novo nome" },
        archived: { type: "boolean", description: "Arquivar/desarquivar" },
        position: { type: "integer" },
        projectId: { type: "string" },
        deepLinking: { type: "boolean" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "delete_campaign",
    description: "Remove permanentemente uma campanha. IRREVERSÍVEL.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "update_campaign_redirect_link",
    description: "Altera o slug do link de redirect de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
        slug: { type: "string", description: "Novo slug único (minúsculas, sem espaços)" },
      },
      required: ["releaseId", "slug"],
    },
  },
  {
    name: "get_campaign_groups",
    description: "Lista os grupos do WhatsApp vinculados a uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "get_campaign_analytics",
    description: "Retorna métricas da campanha: total e por data de adds, removes e clicks.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "generate_campaign_leadscoring",
    description: "Dispara a geração do leadscoring de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },
  {
    name: "get_campaign_leadscoring_url",
    description: "Retorna a URL de download do arquivo de leadscoring (.xlsx) já gerado.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
      },
      required: ["releaseId"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GRUPOS DE CAMPANHAS — 4 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "get_release_group",
    description: "Obtém informações detalhadas de um grupo vinculado a uma campanha (contagem, clicks, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        releaseGroupId: { type: "string", description: "ID do release group" },
      },
      required: ["releaseGroupId"],
    },
  },
  {
    name: "add_release_group",
    description: "Vincula um grupo do WhatsApp a uma campanha existente.",
    inputSchema: {
      type: "object",
      properties: {
        gid: { type: "string", description: "ID do grupo WhatsApp. Ex: '120363292004848696@g.us'" },
        releaseId: { type: "string", description: "ID da campanha" },
        name: { type: "string", description: "Nome do grupo" },
        count: { type: "number", description: "Contagem inicial" },
        full: { type: "boolean", description: "Se o grupo está cheio" },
        type: {
          type: "string",
          enum: ["group", "community", "community_default", "community_group"],
        },
      },
      required: ["gid", "releaseId", "name"],
    },
  },
  {
    name: "update_release_group",
    description: "Atualiza dados de um grupo vinculado a uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseGroupId: { type: "string", description: "ID do release group" },
        name: { type: "string" },
        count: { type: "integer" },
        full: { type: "boolean" },
      },
      required: ["releaseGroupId"],
    },
  },
  {
    name: "delete_release_group",
    description: "Remove um grupo de uma campanha. IRREVERSÍVEL.",
    inputSchema: {
      type: "object",
      properties: {
        releaseGroupId: { type: "string", description: "ID do release group" },
      },
      required: ["releaseGroupId"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. AÇÕES — 9 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "create_whatsapp_group",
    description: "Cria um novo grupo no WhatsApp com participantes específicos.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta WhatsApp" },
        releaseId: { type: "string", description: "ID da campanha" },
        groupName: { type: "string", description: "Nome do grupo a criar" },
        participants: {
          type: "array",
          items: { type: "string" },
          description: "Lista de participantes no formato '557581133148@s.whatsapp.net'",
        },
        assistantId: { type: "string", description: "ID do assistente (opcional)" },
        standardization: { type: "boolean", description: "Padronização (padrão: false)" },
      },
      required: ["accountId", "releaseId", "groupName", "participants"],
    },
  },
  {
    name: "make_group_admin",
    description: "Torna usuários administradores dos grupos de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta WhatsApp" },
        releaseId: { type: "string", description: "ID da campanha" },
        participants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              number: { type: "string", description: "Número sem formatação. Ex: '557581133148'" },
              name: { type: "string", description: "Nome do participante" },
            },
          },
          description: "Lista de participantes a tornar admin",
        },
        chooseSpecificGroups: { type: "boolean", description: "Restringir a grupos específicos" },
        groupIds: {
          type: "array",
          items: { type: "string" },
          description: "GIDs sem @g.us (obrigatório se chooseSpecificGroups=true)",
        },
      },
      required: ["accountId", "releaseId", "participants"],
    },
  },
  {
    name: "send_text_to_campaign",
    description: "Envia mensagem de texto para todos (ou grupos específicos) de uma campanha. Pode ser agendado.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
        accountId: { type: "string", description: "ID da conta que dispara (use OU accountId OU accountIds)" },
        accountIds: { type: "array", items: { type: "string" }, description: "Lista de contas (alternativa a accountId)" },
        messageText: { type: "string", description: "Texto da mensagem" },
        scheduledTo: { type: "string", description: "ISO 8601 UTC para agendamento. Ex: '2025-04-25T13:00:00.000Z'" },
        linkPreview: { type: "boolean", description: "Gerar preview de link" },
        shippingSpeed: {
          type: "string",
          enum: ["none", "fast", "normal", "slow", "custom"],
          description: "none=imediato, fast=10-20s, normal=40-60s, slow=60-120s",
        },
        customSpeedMin: { type: "integer", description: "Segundos mínimos (só para custom)" },
        customSpeedMax: { type: "integer", description: "Segundos máximos (só para custom)" },
        chooseSpecificGroups: { type: "boolean" },
        groupIds: { type: "array", items: { type: "string" } },
      },
      required: ["releaseId", "messageText"],
    },
  },
  {
    name: "send_image_to_campaign",
    description: "Envia imagem para grupos de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string" },
        accountId: { type: "string" },
        accountIds: { type: "array", items: { type: "string" } },
        url: { type: "string", description: "URL pública da imagem" },
        caption: { type: "string" },
        scheduledTo: { type: "string" },
        shippingSpeed: { type: "string", enum: ["none", "fast", "normal", "slow", "custom"] },
        chooseSpecificGroups: { type: "boolean" },
        groupIds: { type: "array", items: { type: "string" } },
      },
      required: ["releaseId", "url"],
    },
  },
  {
    name: "send_video_to_campaign",
    description: "Envia vídeo para grupos de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string" },
        accountId: { type: "string" },
        accountIds: { type: "array", items: { type: "string" } },
        url: { type: "string", description: "URL pública do vídeo" },
        caption: { type: "string" },
        scheduledTo: { type: "string" },
        shippingSpeed: { type: "string", enum: ["none", "fast", "normal", "slow", "custom"] },
        chooseSpecificGroups: { type: "boolean" },
        groupIds: { type: "array", items: { type: "string" } },
      },
      required: ["releaseId", "url"],
    },
  },
  {
    name: "send_audio_to_campaign",
    description: "Envia áudio para grupos de uma campanha.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string" },
        accountId: { type: "string" },
        accountIds: { type: "array", items: { type: "string" } },
        url: { type: "string", description: "URL pública do áudio" },
        ptt: { type: "boolean", description: "true = nota de voz, false = arquivo de áudio" },
        scheduledTo: { type: "string" },
        shippingSpeed: { type: "string", enum: ["none", "fast", "normal", "slow", "custom"] },
        chooseSpecificGroups: { type: "boolean" },
        groupIds: { type: "array", items: { type: "string" } },
      },
      required: ["releaseId", "url"],
    },
  },
  {
    name: "send_message_universal",
    description: "Envia mensagem de qualquer tipo (texto, imagem, vídeo, áudio) com configurações avançadas como expiração e mencionar todos.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string" },
        accountId: { type: "string" },
        accountIds: { type: "array", items: { type: "string" } },
        type: {
          type: "string",
          enum: ["extendedTextMessage", "imageMessage", "videoMessage", "audioMessage"],
          description: "Tipo da mensagem",
        },
        text: { type: "string", description: "Texto (para extendedTextMessage)" },
        url: { type: "string", description: "URL do arquivo (para imagem/vídeo/áudio)" },
        caption: { type: "string" },
        ptt: { type: "boolean", description: "true = nota de voz (só audioMessage)" },
        linkPreview: { type: "boolean" },
        scheduledTo: { type: "string" },
        chooseSpecificGroups: { type: "boolean" },
        groupIds: { type: "array", items: { type: "string" } },
        ephemeralExpiration: { type: "integer", description: "Tempo de expiração da mensagem (-1 = desabilitado)" },
        mentionAllParticipants: { type: "boolean", description: "Mencionar todos os participantes" },
        shippingSpeed: { type: "string", enum: ["none", "fast", "normal", "slow", "custom"] },
        customSpeedMin: { type: "integer" },
        customSpeedMax: { type: "integer" },
      },
      required: ["releaseId", "type"],
    },
  },
  {
    name: "analyze_groups",
    description: "Dispara refresh de análise de grupos (anti-spam) para contas específicas.",
    inputSchema: {
      type: "object",
      properties: {
        accountIds: {
          type: "array",
          items: { type: "string" },
          description: "IDs das contas. Array vazio = usa todas as contas autenticadas.",
        },
      },
      required: ["accountIds"],
    },
  },
  {
    name: "find_participant",
    description: "Verifica se um número está em algum grupo de uma campanha. Retorno síncrono.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta WhatsApp" },
        phoneNumber: { type: "string", description: "Número com código do país. Ex: '5511987654321'" },
        timeout: { type: "number", description: "Timeout em ms (padrão: 60000)" },
      },
      required: ["accountId", "phoneNumber"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. MENSAGENS DIRETAS — 4 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "send_direct_text",
    description: "Envia texto diretamente para um número de telefone específico (não para grupos).",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta WhatsApp que envia" },
        text: { type: "string", description: "Texto da mensagem" },
        phoneNumber: { type: "string", description: "Número com código do país. Ex: '5511987654321'" },
        scheduledTo: { type: "string", description: "ISO 8601 UTC para agendamento" },
      },
      required: ["accountId", "text", "phoneNumber"],
    },
  },
  {
    name: "send_direct_image",
    description: "Envia imagem diretamente para um número de telefone específico.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string" },
        url: { type: "string", description: "URL pública da imagem" },
        caption: { type: "string" },
        phoneNumber: { type: "string", description: "Ex: '5511987654321'" },
        scheduledTo: { type: "string" },
      },
      required: ["accountId", "url", "phoneNumber"],
    },
  },
  {
    name: "send_direct_video",
    description: "Envia vídeo diretamente para um número de telefone específico.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string" },
        url: { type: "string", description: "URL pública do vídeo" },
        caption: { type: "string" },
        phoneNumber: { type: "string", description: "Ex: '5511987654321'" },
        scheduledTo: { type: "string" },
      },
      required: ["accountId", "url", "phoneNumber"],
    },
  },
  {
    name: "send_direct_audio",
    description: "Envia áudio diretamente para um número de telefone específico.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string" },
        url: { type: "string", description: "URL pública do áudio" },
        ptt: { type: "boolean", description: "true = nota de voz" },
        phoneNumber: { type: "string", description: "Ex: '5511987654321'" },
        scheduledTo: { type: "string" },
      },
      required: ["accountId", "url", "phoneNumber"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. TEMPLATES DE MENSAGEM — 4 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "list_templates",
    description: "Lista todos os templates de mensagem cadastrados.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_template",
    description: "Cria um novo template de mensagem. Pode conter múltiplos tipos de mensagem em sequência.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Título do template" },
        template: {
          type: "array",
          description: "Array de mensagens. Cada item tem 'type', 'message' e 'options'.",
          items: { type: "object" },
        },
        folderId: { type: "string" },
        intervalRangeType: {
          type: "string",
          enum: ["none", "seconds", "minutes"],
          description: "Tipo de intervalo entre mensagens",
        },
        intervalRange: {
          type: "array",
          items: { type: "number" },
          description: "Intervalo [min, max] em segundos",
        },
        archived: { type: "boolean" },
      },
      required: ["title", "template"],
    },
  },
  {
    name: "update_template",
    description: "Atualiza um template de mensagem existente.",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "ID do template" },
        title: { type: "string" },
        template: { type: "array", items: { type: "object" } },
        folderId: { type: "string" },
        intervalRangeType: { type: "string" },
        intervalRange: { type: "array", items: { type: "number" } },
        archived: { type: "boolean" },
        position: { type: "integer" },
      },
      required: ["templateId"],
    },
  },
  {
    name: "delete_template",
    description: "Remove um template de mensagem. IRREVERSÍVEL.",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "ID do template" },
      },
      required: ["templateId"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CONTAS — 7 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "list_accounts",
    description: "Lista todas as contas WhatsApp e Email. Use para obter accountIds.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_account",
    description: "Cria uma nova conta WhatsApp ou Email no Sendflow.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome da conta" },
        type: { type: "string", enum: ["whatsapp", "email"], description: "Tipo da conta" },
        provider: {
          type: "string",
          enum: ["aws-ses", "google-api", "gmail"],
          description: "Provedor de email (só para type=email)",
        },
        senderName: { type: "string", description: "Nome do remetente (só para email)" },
        senderEmail: { type: "string", description: "Email do remetente (só para email)" },
        projectId: { type: "string" },
      },
      required: ["name", "type"],
    },
  },
  {
    name: "update_account",
    description: "Atualiza dados de uma conta existente.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta" },
        name: { type: "string" },
        type: { type: "string", enum: ["whatsapp", "email"] },
        provider: { type: "string" },
        senderName: { type: "string" },
        senderEmail: { type: "string" },
      },
      required: ["accountId", "name", "type"],
    },
  },
  {
    name: "delete_account",
    description: "Remove permanentemente uma conta. IRREVERSÍVEL.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta" },
      },
      required: ["accountId"],
    },
  },
  {
    name: "connect_account",
    description: "Inicia conexão de uma conta WhatsApp e gera QR code para leitura.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta" },
      },
      required: ["accountId"],
    },
  },
  {
    name: "disconnect_account",
    description: "Desconecta uma conta WhatsApp.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta" },
      },
      required: ["accountId"],
    },
  },
  {
    name: "get_account_qrcode",
    description: "Obtém status e QR code de uma conta WhatsApp (útil durante conexão).",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "ID da conta" },
      },
      required: ["accountId"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. NÚMEROS BLOQUEADOS — 2 tools
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "list_blocked_numbers",
    description: "Lista todos os números bloqueados no anti-spam.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "block_number",
    description: "Adiciona um número à lista de bloqueados (anti-spam).",
    inputSchema: {
      type: "object",
      properties: {
        number: { type: "string", description: "Número com código do país. Ex: '5511987654321'" },
        name: { type: "string", description: "Nome ou identificação do número" },
      },
      required: ["number", "name"],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. VERIFICAÇÃO DE NÚMERO — 1 tool
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "verify_number",
    description: "Verifica se um número pode receber mensagens de uma campanha (não está bloqueado, opt-out, etc.). Resposta: true = pode receber.",
    inputSchema: {
      type: "object",
      properties: {
        releaseId: { type: "string", description: "ID da campanha" },
        phoneNumber: {
          type: "string",
          description: "Número SEM código do país. Ex Brasil: '11987654321' (sem o 55)",
        },
      },
      required: ["releaseId", "phoneNumber"],
    },
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleTool(name, args) {
  let result;

  switch (name) {

    // ── 1. Campanhas ──────────────────────────────────────────────────────────
    case "list_campaigns":
      result = await callAPI("GET", "/releases");
      break;

    case "get_campaign":
      result = await callAPI("GET", `/releases/${args.releaseId}`);
      break;

    case "create_campaign": {
      const body = { name: args.name, type: args.type };
      if (args.projectId) body.projectId = args.projectId;
      result = await callAPI("POST", "/releases", body);
      break;
    }

    case "update_campaign": {
      const { releaseId, ...fields } = args;
      result = await callAPI("PUT", `/releases/${releaseId}`, fields);
      break;
    }

    case "delete_campaign":
      result = await callAPI("DELETE", `/releases/${args.releaseId}`);
      break;

    case "update_campaign_redirect_link":
      result = await callAPI("PATCH", `/releases/${args.releaseId}/redirect-link`, {
        slug: args.slug,
      });
      break;

    case "get_campaign_groups":
      result = await callAPI("GET", `/releases/${args.releaseId}/groups`);
      break;

    case "get_campaign_analytics":
      result = await callAPI("GET", `/releases/${args.releaseId}/analytics`);
      break;

    case "generate_campaign_leadscoring":
      result = await callAPI("GET", `/releases/${args.releaseId}/leadscoring`);
      break;

    case "get_campaign_leadscoring_url":
      result = await callAPI("GET", `/releases/${args.releaseId}/leadscoring/download`);
      break;

    // ── 2. Grupos de campanha ─────────────────────────────────────────────────
    case "get_release_group":
      result = await callAPI("GET", `/release-groups/${args.releaseGroupId}`);
      break;

    case "add_release_group": {
      const body = { gid: args.gid, releaseId: args.releaseId, name: args.name };
      if (args.count !== undefined) body.count = args.count;
      if (args.full !== undefined) body.full = args.full;
      if (args.type) body.type = args.type;
      result = await callAPI("POST", "/release-groups", body);
      break;
    }

    case "update_release_group": {
      const { releaseGroupId, ...fields } = args;
      result = await callAPI("PUT", `/release-groups/${releaseGroupId}`, fields);
      break;
    }

    case "delete_release_group":
      result = await callAPI("DELETE", `/release-groups/${args.releaseGroupId}`);
      break;

    // ── 3. Ações ──────────────────────────────────────────────────────────────
    case "create_whatsapp_group": {
      const body = {
        accountId: args.accountId,
        releaseId: args.releaseId,
        payload: {
          name: args.groupName,
          participants: args.participants,
        },
      };
      if (args.assistantId) body.assistantId = args.assistantId;
      if (args.standardization !== undefined) body.payload.standardization = args.standardization;
      result = await callAPI("POST", "/actions/group-create", body);
      break;
    }

    case "make_group_admin": {
      const body = {
        accountId: args.accountId,
        releaseId: args.releaseId,
        participants: args.participants,
      };
      if (args.chooseSpecificGroups) {
        body.chooseSpecificGroups = true;
        body.groupIds = args.groupIds || [];
      }
      result = await callAPI("POST", "/actions/make-group-admin", body);
      break;
    }

    case "send_text_to_campaign": {
      const body = { releaseId: args.releaseId, messageText: args.messageText };
      if (args.accountId) body.accountId = args.accountId;
      if (args.accountIds) body.accountIds = args.accountIds;
      if (args.scheduledTo) { body.scheduled = true; body.scheduledTo = args.scheduledTo; }
      if (args.linkPreview !== undefined) body.linkPreview = args.linkPreview;
      if (args.chooseSpecificGroups) { body.chooseSpecificGroups = true; body.groupIds = args.groupIds || []; }
      if (args.shippingSpeed) {
        body.options = { shippingSpeed: args.shippingSpeed };
        if (args.shippingSpeed === "custom") {
          body.options.customShippingSpeed = { min: args.customSpeedMin, max: args.customSpeedMax };
        }
      }
      result = await callAPI("POST", "/actions/send-text-message", body);
      break;
    }

    case "send_image_to_campaign": {
      const body = { releaseId: args.releaseId, url: args.url };
      if (args.accountId) body.accountId = args.accountId;
      if (args.accountIds) body.accountIds = args.accountIds;
      if (args.caption) body.caption = args.caption;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      if (args.chooseSpecificGroups) { body.chooseSpecificGroups = true; body.groupIds = args.groupIds || []; }
      if (args.shippingSpeed) body.options = { shippingSpeed: args.shippingSpeed };
      result = await callAPI("POST", "/actions/send-image-message", body);
      break;
    }

    case "send_video_to_campaign": {
      const body = { releaseId: args.releaseId, url: args.url };
      if (args.accountId) body.accountId = args.accountId;
      if (args.accountIds) body.accountIds = args.accountIds;
      if (args.caption) body.caption = args.caption;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      if (args.chooseSpecificGroups) { body.chooseSpecificGroups = true; body.groupIds = args.groupIds || []; }
      if (args.shippingSpeed) body.options = { shippingSpeed: args.shippingSpeed };
      result = await callAPI("POST", "/actions/send-video-message", body);
      break;
    }

    case "send_audio_to_campaign": {
      const body = { releaseId: args.releaseId, url: args.url };
      if (args.accountId) body.accountId = args.accountId;
      if (args.accountIds) body.accountIds = args.accountIds;
      if (args.ptt !== undefined) body.ptt = args.ptt;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      if (args.chooseSpecificGroups) { body.chooseSpecificGroups = true; body.groupIds = args.groupIds || []; }
      if (args.shippingSpeed) body.options = { shippingSpeed: args.shippingSpeed };
      result = await callAPI("POST", "/actions/send-audio-message", body);
      break;
    }

    case "send_message_universal": {
      const body = { releaseId: args.releaseId, type: args.type };
      if (args.accountId) body.accountId = args.accountId;
      if (args.accountIds) body.accountIds = args.accountIds;
      if (args.text) body.text = args.text;
      if (args.url) body.url = args.url;
      if (args.caption) body.caption = args.caption;
      if (args.ptt !== undefined) body.ptt = args.ptt;
      if (args.linkPreview !== undefined) body.linkPreview = args.linkPreview;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      if (args.chooseSpecificGroups) { body.chooseSpecificGroups = true; body.groupIds = args.groupIds || []; }
      body.options = {};
      if (args.ephemeralExpiration !== undefined) body.options.ephemeralExpiration = args.ephemeralExpiration;
      if (args.mentionAllParticipants !== undefined) body.options.mentionAllParticipants = args.mentionAllParticipants;
      if (args.shippingSpeed) {
        body.options.shippingSpeed = args.shippingSpeed;
        if (args.shippingSpeed === "custom") {
          body.options.customShippingSpeed = { min: args.customSpeedMin, max: args.customSpeedMax };
        }
      }
      result = await callAPI("POST", "/actions/send-message", body);
      break;
    }

    case "analyze_groups":
      result = await callAPI("POST", "/actions/analyze-groups", { accountIds: args.accountIds });
      break;

    case "find_participant": {
      const body = { accountId: args.accountId, phoneNumber: args.phoneNumber };
      if (args.timeout) body.timeout = args.timeout;
      result = await callAPI("POST", "/actions/find-participant", body);
      break;
    }

    // ── 4. Mensagens diretas ──────────────────────────────────────────────────
    case "send_direct_text": {
      const body = { text: args.text, phoneNumber: args.phoneNumber };
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      result = await callAPI("POST", `/send-text-message/${args.accountId}`, body);
      break;
    }

    case "send_direct_image": {
      const body = { url: args.url, phoneNumber: args.phoneNumber };
      if (args.caption) body.caption = args.caption;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      result = await callAPI("POST", `/send-image-message/${args.accountId}`, body);
      break;
    }

    case "send_direct_video": {
      const body = { url: args.url, phoneNumber: args.phoneNumber };
      if (args.caption) body.caption = args.caption;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      result = await callAPI("POST", `/send-video-message/${args.accountId}`, body);
      break;
    }

    case "send_direct_audio": {
      const body = { url: args.url, phoneNumber: args.phoneNumber };
      if (args.ptt !== undefined) body.ptt = args.ptt;
      if (args.scheduledTo) body.scheduledTo = args.scheduledTo;
      result = await callAPI("POST", `/send-audio-message/${args.accountId}`, body);
      break;
    }

    // ── 5. Templates ──────────────────────────────────────────────────────────
    case "list_templates":
      result = await callAPI("GET", "/message-templates");
      break;

    case "create_template": {
      const body = { title: args.title, template: args.template };
      if (args.folderId) body.folderId = args.folderId;
      if (args.intervalRangeType) body.intervalRangeType = args.intervalRangeType;
      if (args.intervalRange) body.intervalRange = args.intervalRange;
      if (args.archived !== undefined) body.archived = args.archived;
      result = await callAPI("POST", "/message-templates", body);
      break;
    }

    case "update_template": {
      const { templateId, ...fields } = args;
      result = await callAPI("PUT", `/message-templates/${templateId}`, fields);
      break;
    }

    case "delete_template":
      result = await callAPI("DELETE", `/message-templates/${args.templateId}`);
      break;

    // ── 6. Contas ─────────────────────────────────────────────────────────────
    case "list_accounts":
      result = await callAPI("GET", "/accounts");
      break;

    case "create_account": {
      const body = { data: { name: args.name, type: args.type } };
      if (args.provider) body.data.provider = args.provider;
      if (args.senderName) body.data.senderName = args.senderName;
      if (args.senderEmail) body.data.senderEmail = args.senderEmail;
      if (args.projectId) body.projectId = args.projectId;
      result = await callAPI("POST", "/accounts/create", body);
      break;
    }

    case "update_account": {
      const body = { data: { name: args.name, type: args.type } };
      if (args.provider) body.data.provider = args.provider;
      if (args.senderName) body.data.senderName = args.senderName;
      if (args.senderEmail) body.data.senderEmail = args.senderEmail;
      result = await callAPI("PUT", `/accounts/${args.accountId}`, body);
      break;
    }

    case "delete_account":
      result = await callAPI("DELETE", `/accounts/${args.accountId}`);
      break;

    case "connect_account":
      result = await callAPI("POST", `/accounts/connect-account/${args.accountId}`);
      break;

    case "disconnect_account":
      result = await callAPI("POST", `/accounts/disconnect-account/${args.accountId}`);
      break;

    case "get_account_qrcode":
      result = await callAPI("GET", `/accounts/${args.accountId}/qrcode`);
      break;

    // ── 7. Números bloqueados ─────────────────────────────────────────────────
    case "list_blocked_numbers":
      result = await callAPI("GET", "/block-numbers");
      break;

    case "block_number":
      result = await callAPI("POST", "/block-numbers", { number: args.number, name: args.name });
      break;

    // ── 8. Verificação ────────────────────────────────────────────────────────
    case "verify_number":
      result = await callAPI("POST", "/verify-number", {
        releaseId: args.releaseId,
        phoneNumber: args.phoneNumber,
      });
      break;

    default:
      return {
        content: [{ type: "text", text: `Ferramenta desconhecida: ${name}` }],
        isError: true,
      };
  }

  return toResult(result);
}

// ─── Inicialização do servidor ────────────────────────────────────────────────

const server = new Server(
  { name: "sendflow-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleTool(name, args || {});
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[sendflow-mcp] Servidor MCP v2.0.0 rodando (${TOOLS.length} ferramentas).`);
