import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${props => props.theme?.typography?.fontFamily || "'Roboto', sans-serif"};
    background-color: ${props => props.theme?.colors?.background || '#FFFFFF'};
    color: ${props => props.theme?.colors?.text || '#333333'};
    line-height: 1.5;
  }

  a {
    color: ${props => props.theme?.colors?.primary || '#E44332'};
    text-decoration: none;
  }
`;