import styled from "styled-components";

const StyledFooter = styled.footer`
    text-align: center;
    background: rgb(74,68,184);
    background: linear-gradient(90deg, rgba(74,68,184,1) 0%, rgba(101,178,232,0.8575805322128851) 0%, rgba(117,191,238,1) 100%);
    position: absolute;
    width: 100%;
    bottom: 0;
`;

export default function Footer() {
    return (
        <StyledFooter>
            <p>An mdever creation</p>
        </StyledFooter>
    );
}