
import { AgentiumClient } from "@semiotic-labs/agentium-sdk";
import { createContext } from "react";

export const AgentiumContext = createContext<AgentiumClient | undefined>(
  undefined
);
