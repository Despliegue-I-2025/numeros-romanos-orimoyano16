const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://evaluador-romanos.vercel.app/",  // dominio permitido
  methods: ["GET", "POST"],                  // métodos permitidos
}));

// Romanos a Arábigos
app.get('/r2a', (req, res) => {
  try {
    const romanNumeral = req.query.roman;
    
    if (!romanNumeral || typeof romanNumeral !== 'string') {
      return res.status(400).json({ 
        error: 'Parámetro roman requerido y debe ser una cadena.',
        code: 'MISSING_PARAM'
      });
    }

    if (romanNumeral.trim().length === 0) {
      return res.status(400).json({ 
        error: 'El parámetro roman no puede estar vacío.',
        code: 'EMPTY_PARAM'
      });
    }

    const arabicNumber = romanToArabic(romanNumeral);
    if (arabicNumber === null) {
      return res.status(400).json({ 
        error: 'Número romano inválido.',
        code: 'INVALID_ROMAN',
        details: `"${romanNumeral}" no es un número romano válido`
      });
    }

    return res.status(200).json({ 
      arabic: arabicNumber,
      roman: romanNumeral.toUpperCase(),
      message: 'Conversión exitosa'
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Arábigos a Romanos
app.get('/a2r', (req, res) => {
  try {
    const raw = req.query.arabic;
    
    if (raw === undefined || raw === null) {
      return res.status(400).json({ 
        error: 'Parámetro arabic requerido.',
        code: 'MISSING_PARAM'
      });
    }

    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Parámetro arabic debe ser una cadena no vacía.',
        code: 'INVALID_PARAM_TYPE'
      });
    }

    const arabicNumber = parseInt(raw, 10);
    if (isNaN(arabicNumber)) {
      return res.status(400).json({ 
        error: 'El parámetro arabic debe ser un número válido.',
        code: 'INVALID_NUMBER',
        details: `"${raw}" no es un número válido`
      });
    }

    const romanNumeral = arabicToRoman(arabicNumber);
    if (romanNumeral === null) {
      return res.status(400).json({ 
        error: 'Número arábigo inválido. Debe estar entre 1 y 3999.',
        code: 'INVALID_RANGE',
        details: `El número ${arabicNumber} está fuera del rango permitido (1-3999)`
      });
    }

    return res.status(200).json({ 
      roman: romanNumeral,
      arabic: arabicNumber,
      message: 'Conversión exitosa'
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/*
// Ruta de información
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido al Conversor de Números Romanos',
    endpoints: {
      'Romano a Arábigo': 'GET /r2a?roman=ROMAN_NUMERAL',
      'Arábigo a Romano': 'GET /a2r?arabic=ARABIC_NUMBER',
      'Health Check': 'GET /health'
    },
    examples: {
      r2a: '/r2a?roman=XIV',
      a2r: '/a2r?arabic=14'
    }
  });
});

*/

/*
// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    code: 'NOT_FOUND',
    details: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: ['/r2a', '/a2r', '/health', '/']
  });
});
*/


/**
 * Convierte un número romano (string) a número arábigo (int).
 */
function romanToArabic(roman) {
  if (typeof roman !== 'string') {
    throw new TypeError('roman debe ser una cadena');
  }
  
  const s = roman.toUpperCase().trim();
  if (s.length === 0) return null;

  if (!/^[IVXLCDM]+$/.test(s)) return null;

  const invalidPatterns = [
    /VV/, /LL/, /DD/,
    /IIII/, /XXXX/, /CCCC/, /MMMM/,
    /IL/, /IC/, /ID/, /IM/,
    /VX/, /VL/, /VC/, /VD/, /VM/,
    /XD/, /XM/,
    /LC/, /LD/, /LM/,
    /DM/
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(s)) return null;
  }

  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let i = 0;

  while (i < s.length) {
    const curr = map[s[i]];
    const next = i + 1 < s.length ? map[s[i + 1]] : 0;

    if (!curr) return null;

    if (next > curr) {
      const validPairs = {
        I: ['V', 'X'],
        X: ['L', 'C'],
        C: ['D', 'M'],
      };
      const currChar = s[i];
      const nextChar = s[i + 1];
      if (!(currChar in validPairs) || !validPairs[currChar].includes(nextChar)) {
        return null;
      }
      total += next - curr;
      i += 2;
    } else {
      total += curr;
      i += 1;
    }
  }

  if (total < 1 || total > 3999) return null;

  const reencoded = arabicToRoman(total);
  if (reencoded === null) return null;
  if (reencoded !== s) {
    return null;
  }

  return total;
}

/**
 * Convierte un número arábigo (integer) en número romano (string).
 */
function arabicToRoman(arabic) {
  if (typeof arabic !== 'number' || !Number.isInteger(arabic)) {
    throw new TypeError('arabic debe ser un entero');
  }
  if (arabic < 1 || arabic > 3999) return null;

  const vals = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let remaining = arabic;
  let res = '';
  for (const [v, r] of vals) {
    while (remaining >= v) {
      res += r;
      remaining -= v;
    }
  }
  return res;
}

// Iniciar servidor
// Exportación para Vercel - 
if (process.env.VERCEL) {
  // Para producción en Vercel
  module.exports = (req, res) => app(req, res);
} else {
  // Para desarrollo local
  if (require.main === module) {
    const server = app.listen(PORT, () => {
      console.log(`✅ Servidor escuchando en el puerto ${server.address().port}`);
    });
  }
  module.exports = { app, romanToArabic, arabicToRoman };
}