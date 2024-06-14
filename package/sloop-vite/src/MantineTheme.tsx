import { MantineColorsTuple, createTheme } from '@mantine/core';

const pirate: MantineColorsTuple = [
  '#f6f0ff',
  '#e6dff2',
  '#c8bbe0',
  '#aa95cd',
  '#9075be',
  '#7f62b4',
  '#7757b1',
  '#66489b',
  '#5a3e8c',
  '#4e357c'
];

// const pirateDark: MantineColorsTuple = [
//   '#4e357c',
//   '#5a3e8c',
//   '#66489b',
//   '#7757b1',
//   '#7f62b4',
//   '#9075be',
//   '#aa95cd',
//   '#c8bbe0',
//   '#e6dff2',
//   '#f6f0ff'
// ];

// const pirate = virtualColor({
//   name: 'pirate',
//   dark: 'pirateDark',
//   light: 'pirateLight',
// })



export const theme = createTheme({
  colors: {
    pirate
  },
  primaryColor: 'pirate',
  autoContrast: true,
});