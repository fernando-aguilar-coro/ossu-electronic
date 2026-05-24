import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '53a'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e71'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'de7'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '469'),
            routes: [
              {
                path: '/cap5',
                component: ComponentCreator('/cap5', '52c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap6',
                component: ComponentCreator('/cap6', '29d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap7',
                component: ComponentCreator('/cap7', '697'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap8',
                component: ComponentCreator('/cap8', 'a7e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/intro',
                component: ComponentCreator('/intro', '9fa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-1-introduccion-y-errores',
                component: ComponentCreator('/parte-1-introduccion-y-errores', 'b10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-1-introduccion-y-errores/cap1-modelos-matematicos',
                component: ComponentCreator('/parte-1-introduccion-y-errores/cap1-modelos-matematicos', 'a46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-1-introduccion-y-errores/cap2-programacion',
                component: ComponentCreator('/parte-1-introduccion-y-errores/cap2-programacion', 'bc0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-1-introduccion-y-errores/cap3-errores',
                component: ComponentCreator('/parte-1-introduccion-y-errores/cap3-errores', '3d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-1-introduccion-y-errores/cap4-taylor',
                component: ComponentCreator('/parte-1-introduccion-y-errores/cap4-taylor', '3a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones',
                component: ComponentCreator('/parte-2-raices-ecuaciones', '4c4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap5-metodos-cerrados/biseccion',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap5-metodos-cerrados/biseccion', '864'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap5-metodos-cerrados/comparativa',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap5-metodos-cerrados/comparativa', '342'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap5-metodos-cerrados/falsa-posicion',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap5-metodos-cerrados/falsa-posicion', 'e87'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap6-metodos-abiertos/comparativa',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap6-metodos-abiertos/comparativa', '189'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap6-metodos-abiertos/newton-raphson',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap6-metodos-abiertos/newton-raphson', '3cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap6-metodos-abiertos/punto-fijo',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap6-metodos-abiertos/punto-fijo', '2b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap6-metodos-abiertos/secante',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap6-metodos-abiertos/secante', 'b04'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap7-raices-polinomios/deflacion-horner',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap7-raices-polinomios/deflacion-horner', '060'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap7-raices-polinomios/localizacion-cauchy',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap7-raices-polinomios/localizacion-cauchy', '39a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap7-raices-polinomios/metodo-bairstow',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap7-raices-polinomios/metodo-bairstow', 'a8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap7-raices-polinomios/metodo-muller',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap7-raices-polinomios/metodo-muller', '9f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap7-raices-polinomios/propiedades',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap7-raices-polinomios/propiedades', '92a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap8-casos-raices/bungee-jump',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap8-casos-raices/bungee-jump', '15b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap8-casos-raices/cable-colgante',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap8-casos-raices/cable-colgante', '238'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap8-casos-raices/circuito-diodo',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap8-casos-raices/circuito-diodo', 'b16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap8-casos-raices/tanque-esferico',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap8-casos-raices/tanque-esferico', '10f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-2-raices-ecuaciones/cap8-casos-raices/viga-vibracion',
                component: ComponentCreator('/parte-2-raices-ecuaciones/cap8-casos-raices/viga-vibracion', '672'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales',
                component: ComponentCreator('/parte-3-ecuaciones-lineales', 'bd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales/cap10-lu',
                component: ComponentCreator('/parte-3-ecuaciones-lineales/cap10-lu', 'ec8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales/cap11-gauss-seidel',
                component: ComponentCreator('/parte-3-ecuaciones-lineales/cap11-gauss-seidel', '4fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales/cap12-casos-lineales',
                component: ComponentCreator('/parte-3-ecuaciones-lineales/cap12-casos-lineales', '8ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales/cap9_5-jacobi-gauss-seidel',
                component: ComponentCreator('/parte-3-ecuaciones-lineales/cap9_5-jacobi-gauss-seidel', '95a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-3-ecuaciones-lineales/cap9-gauss',
                component: ComponentCreator('/parte-3-ecuaciones-lineales/cap9-gauss', '257'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-4-optimizacion',
                component: ComponentCreator('/parte-4-optimizacion', 'ad0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-4-optimizacion/cap13-optimizacion-1d',
                component: ComponentCreator('/parte-4-optimizacion/cap13-optimizacion-1d', 'c9e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-4-optimizacion/cap15-prog-lineal',
                component: ComponentCreator('/parte-4-optimizacion/cap15-prog-lineal', '0be'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-5-ajuste-curvas',
                component: ComponentCreator('/parte-5-ajuste-curvas', 'd29'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-5-ajuste-curvas/cap17-regresion',
                component: ComponentCreator('/parte-5-ajuste-curvas/cap17-regresion', '4ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-5-ajuste-curvas/cap18-interpolacion',
                component: ComponentCreator('/parte-5-ajuste-curvas/cap18-interpolacion', 'd8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-5-ajuste-curvas/cap19-fourier',
                component: ComponentCreator('/parte-5-ajuste-curvas/cap19-fourier', '76e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-6-integracion-diferenciacion',
                component: ComponentCreator('/parte-6-integracion-diferenciacion', '52c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-6-integracion-diferenciacion/cap21-newton-cotes',
                component: ComponentCreator('/parte-6-integracion-diferenciacion/cap21-newton-cotes', 'e8b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-6-integracion-diferenciacion/cap22-gauss-romberg',
                component: ComponentCreator('/parte-6-integracion-diferenciacion/cap22-gauss-romberg', '9c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-6-integracion-diferenciacion/cap23-diferenciacion',
                component: ComponentCreator('/parte-6-integracion-diferenciacion/cap23-diferenciacion', 'd4e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-7-edos',
                component: ComponentCreator('/parte-7-edos', '5ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-7-edos/cap25-runge-kutta',
                component: ComponentCreator('/parte-7-edos/cap25-runge-kutta', 'c18'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-7-edos/cap27-bvp',
                component: ComponentCreator('/parte-7-edos/cap27-bvp', 'bec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-8-edps',
                component: ComponentCreator('/parte-8-edps', '627'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-8-edps/cap30-edp-parabolicas',
                component: ComponentCreator('/parte-8-edps/cap30-edp-parabolicas', '551'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/parte-8-edps/cap31-fem',
                component: ComponentCreator('/parte-8-edps/cap31-fem', 'a08'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
