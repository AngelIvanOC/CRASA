import { createGlobalStyle } from "styled-components";
export const GlobalStyles = createGlobalStyle`
    body{
        margin:0;
        padding: 0;
        box-sizing: border-box;
        background-color: ${({ theme }) => theme.bgtotal};
        font-family: "Inter", sans-serif;
        color: ${({ theme }) => theme.text};
    }
`;
