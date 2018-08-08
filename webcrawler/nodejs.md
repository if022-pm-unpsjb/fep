# Web Crawler con Node.js

En este ejercicio realizarán un sencillo web crawler en Node.js, que dada una dirección web, visitará todos los enlaces relativos que contenga dicha página. No se deberán visitar los enlaces externos o absolutos que contenga la página.

Básicamente, el funcionamiento del crawler es sencillo:
- Obtener la página web indicada.
- Buscar los enlaces relativos en dicha página.
- Visitar cada enlace identificado.

Por cada pagina que se visite se debe indicar:
- La URL de dicha pagina.
- Si la conexión fue exitosa (HTTP Response 200).
- El número de enlaces relativos y absolutos presentes en la página.

Para poder obtener una pagina web, pueden utilizar la librería `request` de Node.js. Lo pueden instalar con el comando `npm install request`. Por ejemplo, para obtener la homepage de Google:

```js
const request = require('request');
request('https://www.google.com.ar', (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body);
});
```

Una vez tengan el crawler funcionando, realizar las siguientes mejoras, en una versión 2:
1. Agregar un parámetro que indique el número máximo de páginas a visitar.
2. Agregar un termino de búsqueda, de manera que se indiquen solo aquellas páginas que contengan dicho termino.
3. Manejo de errores, esto es indicar si una pagina no existe, si ocurrio un timeout, etc.

Finalmente, pasar a una versión 3, en donde:
1. Se pueda indicar un nivel de profundidad, de manera que se sigan también los enlaces relativos de las páginas visitadas. Por ejemplo, un nivel de profundidad igual a 2, buscaría también los enlaces en cada una de las paginas que son enlazadas desde la dirección original.
2. Genere un archivo que contenga una traza de las paginas visitadas, con sus enlaces correspondientes.

El código del crawler deberá ser puesto en un respositorio GitHub.
