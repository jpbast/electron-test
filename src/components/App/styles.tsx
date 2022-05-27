import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  label {
    display: flex;
    gap: 6px;
  }

  div {
    ul {
      li {
        list-style: none;
        margin-left: 10px;
      }
    }
  }
`;
