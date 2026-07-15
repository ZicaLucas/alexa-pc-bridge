# 🕸️ Alexa PC Bridge

Ligar e desligar o PC por comando de voz com a Alexa — sem depender de app pago.
Servidor HTTP leve rodando no PC + AWS Lambda + Alexa Skill, exposto via Cloudflare Tunnel.

## Arquitetura

```
Você fala → Echo → Alexa Skill → AWS Lambda → (HTTPS via Cloudflare Tunnel)
                                                     ↓
                                          Servidor Node no PC
                                          ├── POST /wake     → magic packet (Wake-on-LAN)
                                          └── POST /shutdown → shutdown /s /t 0
```

## Stack

- **Node.js + Express** — servidor no PC
- **wol** — envio do magic packet (Wake-on-LAN)
- **dotenv** — token secreto fora do código
- **AWS Lambda** — back-end serverless da skill (a definir)
- **Cloudflare Tunnel** — expõe o servidor com HTTPS, sem abrir porta

## Pré-requisitos

- Node.js instalado
- PC conectado por **cabo Ethernet** (WoL não é confiável em Wi-Fi)
- Wake-on-LAN habilitado na BIOS e no Windows
- Conta AWS + conta de desenvolvedor Amazon (Alexa)

## Setup

```bash
# instala dependências
npm install

# roda o servidor
node server.js
```

### Variáveis de ambiente (`.env`)

```
PC_TOKEN=seu_token_secreto_aqui
```

Gere um token aleatório no PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})
```

### Configuração do MAC

No `server.js`, preencha a constante `MAC` com o endereço físico do seu adaptador **Ethernet**, usando dois-pontos:

```powershell
getmac /v /fo list
```

Troque os `-` por `:` → ex: `1C-1B-0D-A2-33-F5` vira `1C:1B:0D:A2:33:F5`.

## Habilitar Wake-on-LAN

1. **BIOS/UEFI:** ativar "Wake on LAN" / "Power On by PCIE".
2. **Gerenciador de Dispositivos → Adaptador Ethernet → Propriedades:**
   - Aba *Gerenciamento de Energia*: marcar "Permitir que este dispositivo acorde o computador".
   - Aba *Avançado*: "Wake on Magic Packet" = Habilitado.
3. **Painel de Controle → Opções de Energia:** desmarcar "Ligar inicialização rápida" (Fast Startup quebra o WoL).

## Testes locais

Dica: nos primeiros testes, troque `shutdown /s /t 0` por `/t 60` para não desligar de vez (cancele com `shutdown /a`).

```powershell
# deve responder "desligando"
Invoke-WebRequest -Uri http://localhost:3000/shutdown -Method POST -Headers @{"x-token"="SEU_TOKEN"}

# deve retornar 401
Invoke-WebRequest -Uri http://localhost:3000/shutdown -Method POST -Headers @{"x-token"="errado"}
```

## Roadmap

- [x] Servidor Node com `/wake` e `/shutdown` + autenticação por token
- [ ] Exposição via Cloudflare Tunnel (HTTPS)
- [ ] Alexa Skill (interaction model + intents)
- [ ] AWS Lambda ligando a skill ao servidor
- [ ] Inicialização automática do servidor no boot do Windows

## Segurança

- O token **nunca** vai para o repositório (`.env` está no `.gitignore`).
- Todo request exige o header `x-token` válido.
- O magic packet de "wake" não pode partir do próprio PC (que está desligado) — será servido pela Lambda ou por um dispositivo sempre-ligado na rede.

## Licença

MIT
