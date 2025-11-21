const request = require('supertest');
const { app, romanToArabic, arabicToRoman } = require('../index');

describe('API de Conversión de Números Romanos', () => {
  // Tests para Romano a Arábigo
  describe('Romano a Arábigo (/r2a)', () => {
    test('Caso válido: III debería devolver 200 y 3', async () => {
      const response = await request(app).get('/r2a?roman=III');
      expect(response.status).toBe(200);
      expect(response.body.arabic).toBe(3);
    });

    test('Caso válido: MCMXC debería devolver 200 y 1990', async () => {
      const response = await request(app).get('/r2a?roman=MCMXC');
      expect(response.status).toBe(200);
      expect(response.body.arabic).toBe(1990);
    });

    test('Caso válido con minúsculas: iv debería devolver 200 y 4', async () => {
      const response = await request(app).get('/r2a?roman=iv');
      expect(response.status).toBe(200);
      expect(response.body.arabic).toBe(4);
    });

    // Tests de casos borde inválidos
    test('Caso borde: VV debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=VV');
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_ROMAN');
    });

    test('Caso borde: IIII debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=IIII');
      expect(response.status).toBe(400);
    });

    test('Caso borde: IC debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=IC');
      expect(response.status).toBe(400);
    });

    test('Caso borde: VX debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=VX');
      expect(response.status).toBe(400);
    });

    test('Caso borde: LL debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=LL');
      expect(response.status).toBe(400);
    });

    test('Caso borde: ABC debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=ABC');
      expect(response.status).toBe(400);
    });

    test('Caso borde: parámetro vacío debería devolver error 400', async () => {
      const response = await request(app).get('/r2a?roman=');
      expect(response.status).toBe(400);
    });

    test('Caso borde: sin parámetro debería devolver error 400', async () => {
      const response = await request(app).get('/r2a');
      expect(response.status).toBe(400);
    });
  });

  // Tests para Arábigo a Romano
  describe('Arábigo a Romano (/a2r)', () => {
    test('Caso válido: 1 debería devolver 200 y I', async () => {
      const response = await request(app).get('/a2r?arabic=1');
      expect(response.status).toBe(200);
      expect(response.body.roman).toBe('I');
    });

    test('Caso válido: 3999 debería devolver 200 y MMMCMXCIX', async () => {
      const response = await request(app).get('/a2r?arabic=3999');
      expect(response.status).toBe(200);
      expect(response.body.roman).toBe('MMMCMXCIX');
    });

    test('Caso válido: 2023 debería devolver 200 y MMXXIII', async () => {
      const response = await request(app).get('/a2r?arabic=2023');
      expect(response.status).toBe(200);
      expect(response.body.roman).toBe('MMXXIII');
    });

    // Tests de casos borde inválidos
    test('Caso borde: 0 debería devolver error 400', async () => {
      const response = await request(app).get('/a2r?arabic=0');
      expect(response.status).toBe(400);
    });

    test('Caso borde: 4000 debería devolver error 400', async () => {
      const response = await request(app).get('/a2r?arabic=4000');
      expect(response.status).toBe(400);
    });

    test('Caso borde: número negativo debería devolver error 400', async () => {
      const response = await request(app).get('/a2r?arabic=-10');
      expect(response.status).toBe(400);
    });

    test('Caso borde: texto no numérico debería devolver error 400', async () => {
      const response = await request(app).get('/a2r?arabic=abc');
      expect(response.status).toBe(400);
    });

    test('Caso borde: parámetro vacío debería devolver error 400', async () => {
      const response = await request(app).get('/a2r?arabic=');
      expect(response.status).toBe(400);
    });

    test('Caso borde: sin parámetro debería devolver error 400', async () => {
      const response = await request(app).get('/a2r');
      expect(response.status).toBe(400);
    });
  });

  // Health Check
  describe('Health Check', () => {
    test('Health check debería devolver 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  // Tests unitarios
  describe('Funciones unitarias', () => {
    test('romanToArabic debería manejar casos borde', () => {
      expect(romanToArabic('VV')).toBeNull();
      expect(romanToArabic('IIII')).toBeNull();
      expect(romanToArabic('IC')).toBeNull();
      expect(romanToArabic('IX')).toBe(9);
    });

    test('arabicToRoman debería manejar casos borde', () => {
      expect(arabicToRoman(0)).toBeNull();
      expect(arabicToRoman(4000)).toBeNull();
      expect(arabicToRoman(9)).toBe('IX');
    });
  });
});




describe('GET /a2r', () => {
  it('debería convertir un número válido correctamente', async () => {
    const res = await request(app).get('/a2r?arabic=12');
    expect(res.status).toBe(200);
    expect(res.body.roman).toBe('XII');
    expect(res.body.arabic).toBe(12);
    expect(res.body.message).toBe('Conversión exitosa');
  });

  it('debería rechazar números con caracteres extra', async () => {
    const res = await request(app).get('/a2r?arabic=12abc');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_NUMBER');
    expect(res.body.details).toBe('"12abc" no es un número válido');
  });

  it('debería rechazar valores negativos', async () => {
    const res = await request(app).get('/a2r?arabic=-5');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_NUMBER');
  });

  it('debería rechazar strings vacíos', async () => {
    const res = await request(app).get('/a2r?arabic=');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PARAM_TYPE');
  });

  it('debería rechazar cuando no se pasa el parámetro', async () => {
    const res = await request(app).get('/a2r');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MISSING_PARAM');
  });
});
