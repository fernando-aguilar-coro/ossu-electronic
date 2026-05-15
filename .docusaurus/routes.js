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
    component: ComponentCreator('/', '7be'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '84f'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '0ee'),
            routes: [
              {
                path: '/cap1-modelos-matematicos',
                component: ComponentCreator('/cap1-modelos-matematicos', 'ca0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap1-modelos-matematicos/introduccion',
                component: ComponentCreator('/cap1-modelos-matematicos/introduccion', 'e4d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap10-lu',
                component: ComponentCreator('/cap10-lu', '5af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap10-lu/introduccion',
                component: ComponentCreator('/cap10-lu/introduccion', 'fdf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap11-gauss-seidel',
                component: ComponentCreator('/cap11-gauss-seidel', '9fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap11-gauss-seidel/introduccion',
                component: ComponentCreator('/cap11-gauss-seidel/introduccion', 'f2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap12-casos-lineales',
                component: ComponentCreator('/cap12-casos-lineales', '794'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap12-casos-lineales/introduccion',
                component: ComponentCreator('/cap12-casos-lineales/introduccion', '2a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap13-optimizacion-1d',
                component: ComponentCreator('/cap13-optimizacion-1d', 'cbd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap13-optimizacion-1d/introduccion',
                component: ComponentCreator('/cap13-optimizacion-1d/introduccion', '697'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap15-prog-lineal',
                component: ComponentCreator('/cap15-prog-lineal', '517'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap15-prog-lineal/introduccion',
                component: ComponentCreator('/cap15-prog-lineal/introduccion', 'd84'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap17-regresion',
                component: ComponentCreator('/cap17-regresion', 'd1a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap17-regresion/introduccion',
                component: ComponentCreator('/cap17-regresion/introduccion', '6ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap18-interpolacion',
                component: ComponentCreator('/cap18-interpolacion', '7d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap18-interpolacion/introduccion',
                component: ComponentCreator('/cap18-interpolacion/introduccion', '7e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap19-fourier',
                component: ComponentCreator('/cap19-fourier', '623'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap19-fourier/introduccion',
                component: ComponentCreator('/cap19-fourier/introduccion', 'fd6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap2-programacion',
                component: ComponentCreator('/cap2-programacion', '518'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap2-programacion/introduccion',
                component: ComponentCreator('/cap2-programacion/introduccion', 'db1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap21-newton-cotes',
                component: ComponentCreator('/cap21-newton-cotes', '9b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap21-newton-cotes/introduccion',
                component: ComponentCreator('/cap21-newton-cotes/introduccion', '520'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap22-gauss-romberg',
                component: ComponentCreator('/cap22-gauss-romberg', '25f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap22-gauss-romberg/introduccion',
                component: ComponentCreator('/cap22-gauss-romberg/introduccion', 'cf9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap23-diferenciacion',
                component: ComponentCreator('/cap23-diferenciacion', 'ccf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap23-diferenciacion/introduccion',
                component: ComponentCreator('/cap23-diferenciacion/introduccion', 'e69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap25-runge-kutta',
                component: ComponentCreator('/cap25-runge-kutta', 'a97'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap25-runge-kutta/introduccion',
                component: ComponentCreator('/cap25-runge-kutta/introduccion', '259'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap27-bvp',
                component: ComponentCreator('/cap27-bvp', '0b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap27-bvp/introduccion',
                component: ComponentCreator('/cap27-bvp/introduccion', 'c05'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap3-errores',
                component: ComponentCreator('/cap3-errores', '2c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap3-errores/introduccion',
                component: ComponentCreator('/cap3-errores/introduccion', 'd36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap4-taylor',
                component: ComponentCreator('/cap4-taylor', 'd45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap4-taylor/introduccion',
                component: ComponentCreator('/cap4-taylor/introduccion', 'f6c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap5',
                component: ComponentCreator('/cap5', '52c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap5-metodos-cerrados/biseccion',
                component: ComponentCreator('/cap5-metodos-cerrados/biseccion', 'dd6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap5-metodos-cerrados/comparativa',
                component: ComponentCreator('/cap5-metodos-cerrados/comparativa', '3a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap5-metodos-cerrados/falsa-posicion',
                component: ComponentCreator('/cap5-metodos-cerrados/falsa-posicion', 'd88'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap5-metodos-cerrados/introduccion',
                component: ComponentCreator('/cap5-metodos-cerrados/introduccion', '1db'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap6-metodos-abiertos',
                component: ComponentCreator('/cap6-metodos-abiertos', '1b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap6-metodos-abiertos/introduccion',
                component: ComponentCreator('/cap6-metodos-abiertos/introduccion', 'bb2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap7-raices-polinomios',
                component: ComponentCreator('/cap7-raices-polinomios', '0ff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap7-raices-polinomios/introduccion',
                component: ComponentCreator('/cap7-raices-polinomios/introduccion', 'aef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap8-casos-raices',
                component: ComponentCreator('/cap8-casos-raices', 'e72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap8-casos-raices/introduccion',
                component: ComponentCreator('/cap8-casos-raices/introduccion', '8b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap9-gauss',
                component: ComponentCreator('/cap9-gauss', '2e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/cap9-gauss/introduccion',
                component: ComponentCreator('/cap9-gauss/introduccion', '2bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/intro',
                component: ComponentCreator('/intro', '9fa'),
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
