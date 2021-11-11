import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.primaryText};
    // margin: 0;
    // padding: 0;
    font-family: Mulish-regular;
  }
  .switch-theme{
    position: fixed;
    bottom: 6%;
    right: 4%;
    border: none;
    background: ${({ theme }) => theme.primaryText};
    border-radius: 50%;
    padding: 1rem;
  }
}`;

export default GlobalStyles;