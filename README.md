# Carta digital — Black Pork

Página estática que carga `menu.json` y lo muestra como una carta de restaurante,
con secciones, subsecciones, fotos, precios y variantes.

Está hecha solo con **HTML + CSS + JavaScript vanilla** — sin frameworks ni
build step — así que funciona directamente en **GitHub Pages** sin nada que compilar.

## Archivos

```
index.html   ← estructura
styles.css   ← estilos (estética editorial / steakhouse)
app.js       ← carga el JSON con fetch() y lo renderiza
menu.json    ← los datos
```

## Cómo publicarlo en GitHub Pages

1. Sube los 4 archivos a la **raíz** de un repositorio en GitHub.
2. En el repo: **Settings → Pages**.
3. En *Source*, elige la rama (por ejemplo `main`) y la carpeta `/ (root)`.
4. Guarda. En unos segundos GitHub te dará una URL del tipo
   `https://<tu-usuario>.github.io/<tu-repo>/`.

> Si prefieres servirlo desde una carpeta (por ejemplo `/docs`),
> mueve los 4 archivos ahí y en *Pages* selecciona `/docs` como carpeta.

### ¿Y si tengo el JSON en otra URL?

Edita la primera línea útil de `app.js`:

```js
const MENU_URL = "menu.json";
```

Cámbialo por la URL que quieras (debe permitir CORS, por ejemplo otro raw de
GitHub Pages o un endpoint propio).

## Probarlo en local

Por seguridad los navegadores no dejan a `fetch()` leer ficheros con `file://`,
así que necesitas un servidor estático mínimo:

```bash
# Python 3
python3 -m http.server 8000

# o con Node
npx serve .
```

Y abre <http://localhost:8000>.

## Funcionalidades

- Carga dinámica del JSON sin recompilar nada.
- Navegación por secciones con *scroll spy* (la sección activa se resalta).
- Buscador en vivo (filtra por nombre, descripción y variantes).
- Imágenes con *lazy load* y *placeholder* automático si una falla.
- Precios formateados según la divisa (`EUR` por defecto).
- Variantes de producto (formatos, tamaños, etc.) listadas con su precio.
- Diseño responsive: en móvil pasa a 1 columna automáticamente.
- Animaciones suaves con `prefers-reduced-motion` respetado.

## Estructura esperada del JSON

El renderer asume la siguiente forma (la del archivo de ejemplo):

```jsonc
[
  {
    "restaurant": "Nombre del restaurante",
    "menus": [
      {
        "name": "Carta principal",
        "sections": [
          {
            "name": "Bebidas y vinos",
            "subsections": [
              {
                "name": "Refrescos",
                "products": [
                  {
                    "name": "Coca-Cola",
                    "description": "350 ml",
                    "base_price": 2.9,
                    "currency": "EUR",
                    "variants": [
                      { "attribute": "Formato", "value": "Lata", "price": 2.9 }
                    ],
                    "image_url": "https://..."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
```

Toma el **primer restaurante** y el **primer menú** del array. Si necesitas
mostrar varios restaurantes o cambiar entre menús, dímelo y lo amplío.
