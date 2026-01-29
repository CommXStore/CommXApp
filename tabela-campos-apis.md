# Tabela Comparativa - Campos de Produto das APIs

## Legenda
- ✅ = Campo presente/obrigatório
- 🔶 = Campo presente/recomendado
- ⭕ = Campo presente/opcional
- ❌ = Campo não presente

---

## 1. Identificação e Dados Básicos

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **ID** | Identificador único do produto | ✅ Obrigatório (`id`) | ✅ Obrigatório (`id`) | ✅ Obrigatório (`barcode` ou `externalCode`) | ✅ Obrigatório (`id`) | String (50 chars) | SKU, código único |
| **Title** | Nome/título do produto | ✅ Obrigatório (`title`) | ✅ Obrigatório (`title`) | ✅ Obrigatório (`name`) | ✅ Obrigatório (`title`) | String (150 chars) | Descrição principal |
| **Description** | Descrição detalhada | ✅ Obrigatório (`description`) | ✅ Obrigatório (`description`) | ⭕ Opcional (`description`) | ✅ Obrigatório (`description`) | String (5000 chars) | Texto descritivo |
| **Link** | URL da página do produto | ✅ Obrigatório (`link`) | ✅ Obrigatório (`link`) | ❌ | ✅ Obrigatório (`link`) | URL válida | Página de destino |
| **Brand** | Marca do produto | ✅ Obrigatório* (`brand`) | ⭕ Opcional (`brand`) | ⭕ Opcional (`brand`) | ✅ Obrigatório* (`brand`) | String (70 chars) | *Exceto livros/filmes |
| **GTIN** | Código de barras global | 🔶 Recomendado (`gtin`) | ⭕ Opcional (`gtin`) | ⭕ Opcional (`barcode`) | 🔶 Recomendado (`gtin`) | String numérica (8-14) | UPC, EAN, ISBN |
| **MPN** | Número de peça do fabricante | ✅ Obrigatório* (`mpn`) | ⭕ Opcional (`mpn`) | ❌ | ✅ Obrigatório* (`mpn`) | String (70 chars) | *Se não tiver GTIN |
| **PLU** | Código interno do produto | ❌ | ❌ | ⭕ Opcional (`plu`) | ❌ | String | Controle interno iFood |
| **Content ID** | ID de conteúdo | ❌ | ⭕ Opcional (`content_id`) | ❌ | ❌ | String (100 chars) | Para anúncios dinâmicos |
| **Offer ID** | ID da oferta | ✅ Obrigatório (`offerId`) | ❌ | ❌ | 🔶 Recomendado (`offer_id`) | String | SKU+vendedor+preço |

---

## 2. Imagens e Mídia

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Image Link** | URL da imagem principal | ✅ Obrigatório (`image_link`) | ✅ Obrigatório (`image_link`) | ⭕ Opcional (`imageUrl`) | ✅ Obrigatório (`image_link`) | URL | JPEG, PNG, WebP |
| **Additional Images** | Imagens adicionais | ⭕ Opcional (`additional_image_link`) | ⭕ Opcional (`additional_image_link`) | ❌ | ⭕ Opcional (`additional_image_link`) | URL array | Até 10-20 imagens |
| **Video Link** | URL de vídeo do produto | ❌ | ❌ | ❌ | ⭕ Opcional (`video_link`) | URL | YouTube, links públicos |
| **3D Model Link** | Modelo 3D do produto | ⭕ Opcional (`virtual_model_link`) | ❌ | ❌ | ⭕ Opcional (`model_3d_link`) | URL | GLB/GLTF formato |
| **Mobile Link** | Link otimizado para mobile | ⭕ Opcional (`mobile_link`) | ❌ | ❌ | ❌ | URL | Versão mobile |

---

## 3. Preço e Disponibilidade

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Price** | Preço regular | ✅ Obrigatório (`price`) | ✅ Obrigatório (`price`) | ✅ Obrigatório (`price` ou `value`) | ✅ Obrigatório (`price`) | Número + moeda ISO 4217 | Preço normal |
| **Sale Price** | Preço promocional | ⭕ Opcional (`sale_price`) | ⭕ Opcional (`sale_price`) | ⭕ Opcional (`promotionPrice` ou `valorPromocao`) | ⭕ Opcional (`sale_price`) | Número + moeda | Preço com desconto |
| **Sale Effective Date** | Período da promoção | ⭕ Opcional (`sale_price_effective_date`) | ⭕ Opcional (`sale_price_effective_date`) | ❌ | ⭕ Opcional (`sale_price_effective_date`) | ISO 8601 date range | Data início/fim |
| **Original Value** | Valor original | ❌ | ❌ | ⭕ Opcional (`originalValue`) | ❌ | Número + moeda | Para mostrar "de-por" |
| **Scale Prices** | Preços por atacado | ❌ | ❌ | ⭕ Opcional (`scalePrices`) | ❌ | Array de preço+qtd | Desconto por quantidade |
| **Availability** | Disponibilidade | ✅ Obrigatório (`availability`) | ✅ Obrigatório (`availability`) | ✅ Obrigatório (`active`) | ✅ Obrigatório (`availability`) | Enum | in_stock, out_of_stock, preorder |
| **Availability Date** | Data de disponibilidade | ✅ Obrigatório* (`availability_date`) | ❌ | ❌ | ✅ Obrigatório* (`availability_date`) | ISO 8601 | *Se preorder |
| **Inventory/Stock** | Quantidade em estoque | ❌ | ⭕ Opcional (`inventory`) | ⭕ Opcional (`stock`) | ✅ Obrigatório (`inventory_quantity`) | Integer | Estoque disponível |
| **Condition** | Condição do produto | ✅ Obrigatório* (`condition`) | ⭕ Opcional (`condition`) | ❌ | ✅ Obrigatório* (`condition`) | Enum | new, refurbished, used |
| **Expiration Date** | Data de expiração | ⭕ Opcional (`expiration_date`) | ❌ | ❌ | ⭕ Opcional (`expiration_date`) | ISO 8601 | Retirar após data |

---

## 4. Categorização

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Google Product Category** | Categoria do Google | ⭕ Opcional (`google_product_category`) | ⭕ Opcional (`google_product_category`) | ❌ | ❌ | String ou ID numérico | Taxonomia Google |
| **Product Type** | Tipo de produto | ⭕ Opcional (`product_type`) | ❌ | ❌ | ❌ | String (750 chars) | Categoria personalizada |
| **Product Category** | Categoria do produto | ❌ | ⭕ Opcional (`product_category`) | ⭕ Opcional (`category`) | ✅ Obrigatório (`product_category`) | String | Caminho da categoria |
| **Department/Category/SubCategory** | Hierarquia de categorias | ❌ | ❌ | ⭕ Opcional (`categorization`) | ❌ | Objeto | Estrutura iFood |

---

## 5. Variantes

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Item Group ID** | ID do grupo de variantes | ✅ Obrigatório* (`item_group_id`) | ⭕ Opcional (`item_group_id`) | ❌ | ✅ Obrigatório* (`item_group_id`) | String (70 chars) | *Se tiver variantes |
| **Color** | Cor do produto | ✅ Obrigatório* (`color`) | ⭕ Opcional (`color`) | ❌ | 🔶 Recomendado (`color`) | String (100 chars) | *Para vestuário |
| **Size** | Tamanho | ✅ Obrigatório* (`size`) | ⭕ Opcional (`size`) | ⭕ Opcional (`size`) | 🔶 Recomendado (`size`) | String (100 chars) | *Para vestuário/calçados |
| **Size Type** | Tipo de tamanho | ⭕ Opcional (`size_type`) | ❌ | ❌ | ❌ | Enum | petite, plus, maternity |
| **Size System** | Sistema de tamanho | ⭕ Opcional (`size_system`) | ❌ | ❌ | 🔶 Recomendado (`size_system`) | ISO 3166 | US, UK, EU, etc |
| **Gender** | Gênero | ✅ Obrigatório* (`gender`) | ⭕ Opcional (`gender`) | ❌ | 🔶 Recomendado (`gender`) | Enum | male, female, unisex |
| **Age Group** | Faixa etária | ✅ Obrigatório* (`age_group`) | ⭕ Opcional (`age_group`) | ❌ | ⭕ Opcional (`age_group`) | Enum | newborn, infant, toddler, kids, adult |
| **Material** | Material do produto | ✅ Obrigatório* (`material`) | ⭕ Opcional (`material`) | ❌ | ✅ Obrigatório (`material`) | String (200 chars) | Tecido, material |
| **Pattern** | Padrão/estampa | ✅ Obrigatório* (`pattern`) | ⭕ Opcional (`pattern`) | ❌ | ❌ | String (100 chars) | Listrado, poá, etc |
| **Custom Variants** | Variantes personalizadas | ❌ | ❌ | ❌ | ⭕ Opcional (`custom_variant1/2/3`) | String | Dimensões customizadas |

---

## 6. Dimensões e Peso

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Product Length** | Comprimento | ⭕ Opcional (`product_length`) | ❌ | ❌ | ⭕ Opcional (`length`) | Número + unidade | cm, in |
| **Product Width** | Largura | ⭕ Opcional (`product_width`) | ❌ | ❌ | ⭕ Opcional (`width`) | Número + unidade | cm, in |
| **Product Height** | Altura | ⭕ Opcional (`product_height`) | ❌ | ❌ | ⭕ Opcional (`height`) | Número + unidade | cm, in |
| **Dimensions** | Dimensões combinadas | ❌ | ❌ | ❌ | ⭕ Opcional (`dimensions`) | String LxWxH | Formato consolidado |
| **Product Weight** | Peso do produto | ⭕ Opcional (`product_weight`) | ❌ | ❌ | ✅ Obrigatório (`weight`) | Número + unidade | lb, oz, g, kg |
| **Volume** | Volume | ❌ | ❌ | ⭕ Opcional (`volume`) | ❌ | String | Informação adicional |
| **Unit** | Unidade de medida | ❌ | ❌ | ⭕ Opcional (`unit`) | ❌ | String | kg, L, etc |

---

## 7. Envio (Shipping)

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Shipping** | Informações de envio | ✅ Obrigatório* (`shipping`) | ⭕ Opcional (`shipping`) | ❌ | ✅ Obrigatório* (`shipping`) | Estrutura complexa | País:região:serviço:preço |
| **Shipping Weight** | Peso para envio | ⭕ Opcional (`shipping_weight`) | ⭕ Opcional (`shipping_weight`) | ❌ | ❌ | Número + unidade | Para cálculo de frete |
| **Shipping Length/Width/Height** | Dimensões para envio | ⭕ Opcional (`shipping_length/width/height`) | ❌ | ❌ | ❌ | Número + unidade | Dimensões da embalagem |
| **Shipping Label** | Etiqueta de envio | ⭕ Opcional (`shipping_label`) | ❌ | ❌ | ❌ | String (100 chars) | Categoria de envio |
| **Ships From Country** | País de origem | ⭕ Opcional (`ships_from_country`) | ⭕ Opcional (`origin_country`) | ❌ | ❌ | ISO 3166-1 alpha-2 | Código do país |
| **Delivery Estimate** | Estimativa de entrega | ❌ | ❌ | ❌ | ⭕ Opcional (`delivery_estimate`) | ISO 8601 | Data estimada |
| **Pickup Method** | Método de retirada | ❌ | ❌ | ❌ | ⭕ Opcional (`pickup_method`) | Enum | in_store, reserve, not_supported |

---

## 8. Informações Complementares

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Adult** | Conteúdo adulto | ✅ Obrigatório* (`adult`) | ❌ | ❌ | ❌ | Boolean | *Se aplicável |
| **Multipack** | Quantidade no pacote | ✅ Obrigatório* (`multipack`) | ❌ | ⭕ Opcional (`multiple`) | ❌ | Integer | *Para multipacks |
| **Bundle** | É um bundle/combo | ✅ Obrigatório* (`is_bundle`) | ❌ | ⭕ Opcional (tipo `combo`) | ❌ | Boolean | *Para bundles |
| **Product Detail** | Detalhes técnicos | ⭕ Opcional (`product_detail`) | ❌ | ❌ | ❌ | Estrutura | Especificações |
| **Product Highlight** | Destaques do produto | ⭕ Opcional (`product_highlight`) | ❌ | ❌ | ❌ | String (150 chars) | 2-100 destaques |
| **Near Expiration** | Próximo ao vencimento | ❌ | ❌ | ⭕ Opcional (`nearExpiration`) | ❌ | Boolean | Produtos perecíveis |
| **Family** | Família do produto | ❌ | ❌ | ⭕ Opcional (`family`) | ❌ | String | Agrupamento iFood |

---

## 9. Pricing Adicional

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Unit Pricing Measure** | Medida de precificação | ⭕ Opcional (`unit_pricing_measure`) | ❌ | ❌ | ⭕ Opcional (`unit_pricing_measure`) | Número + unidade | Ex: 1.5kg |
| **Unit Pricing Base** | Base de precificação | ⭕ Opcional (`unit_pricing_base_measure`) | ❌ | ❌ | ⭕ Opcional (`base_measure`) | Número + unidade | Ex: 100g |
| **Installment** | Parcelamento | ⭕ Opcional (`installment`) | ❌ | ❌ | ❌ | Estrutura | Meses:valor:entrada |
| **Subscription Cost** | Custo de assinatura | ⭕ Opcional (`subscription_cost`) | ❌ | ❌ | ❌ | Estrutura | Período:valor |
| **Loyalty Program** | Programa de fidelidade | ⭕ Opcional (`loyalty_program`) | ❌ | ❌ | ❌ | Estrutura | Preços especiais |
| **Minimum Price** | Preço mínimo | ⭕ Opcional (`auto_pricing_min_price`) | ❌ | ❌ | ❌ | Número + moeda | Para descontos automáticos |
| **Maximum Retail Price** | Preço máximo de varejo | ⭕ Opcional (`maximum_retail_price`) | ❌ | ❌ | ❌ | Número + moeda | Apenas IN |
| **Cost of Goods Sold** | Custo do produto | ⭕ Opcional (`cost_of_goods_sold`) | ❌ | ❌ | ❌ | Número + moeda | Para análise |

---

## 10. Certificações e Compliance

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Certification** | Certificações do produto | ✅ Obrigatório* (`certification`) | ❌ | ❌ | ❌ | Estrutura | *UE/EFTA/UK eficiência |
| **Energy Efficiency Class** | Classe energética | ⭕ Opcional (`energy_efficiency_class`) | ❌ | ❌ | ❌ | Enum A+++ a G | CH, NO, UK |
| **Min/Max Energy Class** | Faixa energética | ⭕ Opcional (`min/max_energy_efficiency_class`) | ❌ | ❌ | ❌ | Enum | Faixa da categoria |
| **Warning** | Avisos/disclaimers | ❌ | ❌ | ❌ | 🔶 Recomendado (`warning`) | String/URL | Avisos legais |
| **Age Restriction** | Restrição de idade | ❌ | ❌ | ❌ | 🔶 Recomendado (`age_restriction`) | Integer | Idade mínima |
| **Importer Info (India)** | Info do importador | ❌ | ⭕ Obrigatório* (`importer_name/address`) | ❌ | ❌ | String | *WhatsApp Índia |

---

## 11. Reviews e Avaliações

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Product Review Count** | Quantidade de avaliações | ❌ | ❌ | ❌ | 🔶 Recomendado (`product_review_count`) | Integer | Número de reviews |
| **Product Review Rating** | Nota média do produto | ❌ | ❌ | ❌ | 🔶 Recomendado (`product_review_rating`) | Número 0-5 | Avaliação média |
| **Store Review Count** | Avaliações da loja | ❌ | ❌ | ❌ | ⭕ Opcional (`store_review_count`) | Integer | Reviews da marca |
| **Store Review Rating** | Nota da loja | ❌ | ❌ | ❌ | ⭕ Opcional (`store_review_rating`) | Número 0-5 | Rating da loja |
| **Q&A** | Perguntas e respostas | ❌ | ❌ | ❌ | 🔶 Recomendado (`q_and_a`) | String | FAQ do produto |
| **Raw Review Data** | Dados brutos de reviews | ❌ | ❌ | ❌ | 🔶 Recomendado (`raw_review_data`) | String/JSON | Payload completo |

---

## 12. Performance e Sinais

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Popularity Score** | Pontuação de popularidade | ❌ | ❌ | ❌ | 🔶 Recomendado (`popularity_score`) | Número | Indicador de vendas |
| **Return Rate** | Taxa de devolução | ❌ | ❌ | ❌ | 🔶 Recomendado (`return_rate`) | Porcentagem 0-100 | Taxa de retorno |
| **Pricing Trend** | Tendência de preço | ❌ | ❌ | ❌ | ⭕ Opcional (`pricing_trend`) | String (80 chars) | Ex: "Menor preço em 6 meses" |

---

## 13. Merchant/Seller Info

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **External Seller ID** | ID externo do vendedor | ⭕ Opcional (`external_seller_id`) | ❌ | ❌ | ❌ | String (50 chars) | Para marketplaces |
| **Seller Name** | Nome do vendedor | ❌ | ❌ | ❌ | ✅ Obrigatório (`seller_name`) | String (70 chars) | Nome da loja |
| **Seller URL** | URL da loja | ❌ | ❌ | ❌ | ✅ Obrigatório (`seller_url`) | URL | Página do vendedor |
| **Seller Privacy Policy** | Política de privacidade | ❌ | ❌ | ❌ | ✅ Obrigatório* (`seller_privacy_policy`) | URL | *Se checkout habilitado |
| **Seller Terms of Service** | Termos de serviço | ❌ | ❌ | ❌ | ✅ Obrigatório* (`seller_tos`) | URL | *Se checkout habilitado |

---

## 14. Políticas de Devolução

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Return Policy** | Política de devolução | ❌ | ❌ | ❌ | ✅ Obrigatório (`return_policy`) | URL | URL da política |
| **Return Window** | Prazo de devolução | ❌ | ❌ | ❌ | ✅ Obrigatório (`return_window`) | Integer (dias) | Dias permitidos |

---

## 15. Produtos Relacionados

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Related Product ID** | IDs de produtos relacionados | ❌ | ❌ | ❌ | 🔶 Recomendado (`related_product_id`) | String (lista) | Produtos associados |
| **Relationship Type** | Tipo de relacionamento | ❌ | ❌ | ❌ | 🔶 Recomendado (`relationship_type`) | Enum | part_of_set, substitute, etc |

---

## 16. Geolocalização

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Geo Price** | Preço por região | ❌ | ❌ | ❌ | 🔶 Recomendado (`geo_price`) | Número + moeda + região | Preço regional |
| **Geo Availability** | Disponibilidade por região | ❌ | ❌ | ❌ | 🔶 Recomendado (`geo_availability`) | String + região | Estoque regional |

---

## 17. Flags e Configurações (OpenAI Específico)

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Enable Search** | Habilitar busca no ChatGPT | ❌ | ❌ | ❌ | ✅ Obrigatório (`enable_search`) | Boolean | Permite descoberta |
| **Enable Checkout** | Habilitar compra no ChatGPT | ❌ | ❌ | ❌ | ✅ Obrigatório (`enable_checkout`) | Boolean | Permite checkout |

---

## 18. Campos Shopping Campaigns (Google)

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Ads Redirect** | URL com parâmetros adicionais | ⭕ Opcional (`ads_redirect`) | ❌ | ❌ | ❌ | URL (2000 chars) | URL alternativa para ads |
| **Custom Label 0-4** | Etiquetas personalizadas | ⭕ Opcional (`custom_label_0-4`) | ⭕ Opcional (`custom_label_0-4`) | ❌ | ❌ | String (100 chars) | Organização de campanhas |
| **Promotion ID** | ID da promoção | ⭕ Opcional (`promotion_id`) | ❌ | ❌ | ❌ | String (50 chars) | Vincular promoções |
| **Lifestyle Image Link** | Imagem lifestyle | ⭕ Opcional (`lifestyle_image_link`) | ❌ | ❌ | ❌ | URL | Para surfaces browsy |
| **Short Title** | Título curto | ⭕ Opcional (`short_title`) | ❌ | ❌ | ❌ | String (150 chars) | Para Demand Gen |

---

## 19. Destinos (Google)

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Excluded Destination** | Excluir destino | ⭕ Opcional (`excluded_destination`) | ❌ | ❌ | ❌ | Enum | Shopping_ads, Display_ads, etc |
| **Included Destination** | Incluir destino | ⭕ Opcional (`included_destination`) | ❌ | ❌ | ❌ | Enum | Destinos habilitados |
| **Excluded Countries** | Países excluídos | ⭕ Opcional (`shopping_ads_excluded_country`) | ❌ | ❌ | ❌ | ISO 3166-1 | Lista de países |
| **Pause** | Pausar produto | ⭕ Opcional (`pause`) | ❌ | ❌ | ❌ | String | Pausar ads |

---

## 20. Canais e Status (Facebook/iFood)

| Campo | Descrição | Google Merchant | Facebook/WhatsApp | iFood | OpenAI Agentic | Tipo de Dados | Observações |
|-------|-----------|----------------|-------------------|-------|----------------|---------------|-------------|
| **Status** | Status do item | ❌ | ⭕ Opcional (`status`) | ⭕ Opcional (`active`) | ❌ | Enum/Boolean | active, archived / true, false |
| **Channels** | Canais de venda | ❌ | ❌ | ⭕ Opcional (`channels`) | ❌ | Array | Lista de canais |

---

## Resumo por API

### Google Merchant Center
- **Total de campos**: ~90+ campos
- **Foco**: Shopping ads, free listings, varejo online
- **Destaques**: Campos mais completos para variantes, shipping detalhado, certificações energéticas

### Facebook/WhatsApp Business Catalog
- **Total de campos**: ~40+ campos
- **Foco**: Comércio social, catálogos para WhatsApp Business
- **Destaques**: Integração com anúncios dinâmicos, campos para importadores (Índia)

### iFood
- **Total de campos**: ~35+ campos
- **Foco**: Delivery de alimentos e produtos
- **Destaques**: Campos específicos para food (volume, unidade, combo, vencimento próximo)

### OpenAI Agentic Commerce
- **Total de campos**: ~70+ campos
- **Foco**: Compras via ChatGPT com checkout integrado
- **Destaques**: Reviews/Q&A, produtos relacionados, flags de habilitação, geolocalização

---

## Observações Importantes

### Diferenças Regionais
- **Google**: Campos específicos por país (ex: maximum_retail_price apenas para Índia)
- **Facebook**: Campos obrigatórios para importadores na Índia
- **iFood**: Estrutura brasileira focada em delivery
- **OpenAI**: Estrutura global com suporte a geo-targeting

### Campos Únicos por Plataforma

**Google Merchant**:
- Certificações energéticas (UE/EFTA/UK)
- Shipping detalhado com transit/handling business days
- Loyalty programs
- Subscription cost

**Facebook/WhatsApp**:
- Custom labels para anúncios
- Origin country específico
- Importer info para Índia

**iFood**:
- PLU (código interno)
- Near expiration
- Family (agrupamento)
- Scale prices (atacado)
- Combo/multiple

**OpenAI Agentic Commerce**:
- Enable search/checkout flags
- Review data completo
- Related products com relationship type
- Geo pricing/availability
- Popularity score e return rate
- Q&A structured data

### Formatos de Dados Comuns
- **Datas**: ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDThh:mm)
- **Moeda**: ISO 4217 (USD, BRL, EUR, etc)
- **País**: ISO 3166-1 alpha-2 (US, BR, UK, etc)
- **URLs**: RFC 1738/2396 (https://...)
- **Imagens**: JPEG, PNG, WebP (Google/OpenAI suportam também GIF, BMP, TIFF)

### Melhores Práticas
1. **IDs únicos**: Manter consistência entre plataformas
2. **Imagens**: Alta qualidade, múltiplos ângulos quando possível
3. **Descrições**: Detalhadas mas sem promotional text
4. **Preços**: Sempre incluir moeda e manter atualizados
5. **Estoque**: Atualizar frequentemente para evitar frustração do cliente
6. **Variantes**: Usar item_group_id consistentemente

---

**Fontes consultadas:**
- Google Merchant Center Product Data Specification
- Facebook Commerce Manager / WhatsApp Business Catalog API
- iFood Developer Documentation
- OpenAI Agentic Commerce Product Feed Spec