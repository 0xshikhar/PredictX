"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { usePrivyWallet } from "@/lib/hooks/usePrivyWallet";
import {
  Send,
  Bot,
  User,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Shield,
  Search,
  ArrowDown,
  Wallet,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
// import { ResponsiveContainer } from '@/components/molecule/responsive-container';
import { cn } from "@/lib/utils";

/**
 * Render plain text with explicit line breaks preserved.
 */
const renderTextWithLineBreaks = (text: string): React.ReactNode[] => {
  const parts = text.split(/\n/);
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, idx) => {
    nodes.push(<span key={`ln-${idx}`}>{part}</span>);
    if (idx < parts.length - 1) nodes.push(<br key={`br-${idx}`} />);
  });
  return nodes;
};

/**
 * Custom renderer for markdown-like content in agent messages
 * - Supports headings (##, ###)
 * - Supports bullet/numbered/lettered lists (-, *, •, 1., A.)
 * - Preserves single line breaks inside paragraphs
 */
const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return <p>No content</p>;

  // Split text by paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, i) => {
        // Check for headings
        if (paragraph.startsWith("## ")) {
          const content = paragraph.replace(/^## /, "");
          return (
            <h2 key={i} className="text-lg font-normal my-2">
              {content}
            </h2>
          );
        }

        if (paragraph.startsWith("### ")) {
          const content = paragraph.replace(/^### /, "");
          return (
            <h3 key={i} className="text-md font-normal my-2">
              {content}
            </h3>
          );
        }

        // Detect bullet/numbered/lettered lists across lines
        const lines = paragraph.split(/\n/);
        const bulletRegex = /^(?:[-*]|•|\d+\.|[A-Z]\.)\s+/; // -, *, •, 1., A.
        const bulletLines = lines.filter((l) => bulletRegex.test(l.trim()));
        if (bulletLines.length >= 2) {
          // Split into optional preface + bullets
          const preface: string[] = [];
          const items: string[] = [];
          lines.forEach((l) => {
            const t = l.trim();
            if (bulletRegex.test(t)) {
              items.push(t.replace(bulletRegex, ""));
            } else if (t.length) {
              preface.push(t);
            }
          });

          return (
            <div key={i}>
              {preface.length > 0 && (
                <p className="my-2">
                  {processInlineMarkdown(preface.join("\n"))}
                </p>
              )}
              <ul className="list-disc pl-5 my-2">
                {items.map((item, j) => (
                  <li key={`${i}-${j}`} className="my-1">
                    {processInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Regular paragraph with inline formatting and line breaks
        return (
          <p key={i} className="my-2">
            {processInlineMarkdown(paragraph)}
          </p>
        );
      })}
    </>
  );
};

/**
 * Process inline markdown elements like bold and code
 */
const processInlineMarkdown = (text: string): React.ReactNode[] => {
  // Split by bold and code markers to process them separately
  const parts = [];
  let lastIndex = 0;
  let key = 0;

  // Process bold text: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let boldMatch;

  while ((boldMatch = boldRegex.exec(text)) !== null) {
    if (boldMatch.index > lastIndex) {
      // Add text before the match
      parts.push(
        <span key={key++}>
          {processCodeBlocks(text.substring(lastIndex, boldMatch.index))}
        </span>
      );
    }

    // Add the bold text
    parts.push(
      <strong key={key++} className="font-normal text-purple-300">
        {processCodeBlocks(boldMatch[1])}
      </strong>
    );

    lastIndex = boldMatch.index + boldMatch[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={key++}>{processCodeBlocks(text.substring(lastIndex))}</span>
    );
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

/**
 * Process inline code blocks
 */
const processCodeBlocks = (text: string): React.ReactNode[] => {
  // Split by code markers `code`
  const parts = [];
  let lastIndex = 0;
  let key = 0;

  const codeRegex = /`([^`]+)`/g;
  let codeMatch;

  while ((codeMatch = codeRegex.exec(text)) !== null) {
    if (codeMatch.index > lastIndex) {
      // Add text before the match (preserve line breaks)
      parts.push(
        <span key={key++}>
          {renderTextWithLineBreaks(text.substring(lastIndex, codeMatch.index))}
        </span>
      );
    }

    // Add the code block
    parts.push(
      <code key={key++} className="bg-gray-800 rounded px-1 py-0.5 text-xs">
        {codeMatch[1]}
      </code>
    );

    lastIndex = codeMatch.index + codeMatch[0].length;
  }

  // Add any remaining text (preserve line breaks)
  if (lastIndex < text.length) {
    parts.push(
      <span key={key++}>
        {renderTextWithLineBreaks(text.substring(lastIndex))}
      </span>
    );
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

const AgentChatPage = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const {
    walletAddress,
    agentWalletStatus,
    agentWalletAddress,
    refreshAgentWallet,
  } = usePrivyWallet();
  const isMobile = useIsMobile();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Message type definition
  type Message = {
    id: string;
    content: string;
    sender: "user" | "agent";
    timestamp: Date;
    agentType?: string;
  };

  // Unified message store
  const [messages, setMessages] = useState<Array<Message>>([
    {
      id: "1",
      content:
        "Hello! I'm your Surfer AI Portfolio Assistant. I can help with research, portfolio optimization, risk management, and automation strategies. How can I assist you today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);

  // Unified input value
  const [inputValue, setInputValue] = useState("");

  const [selectedAgent, setSelectedAgent] = useState<string>("optimizer");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check scroll position to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollToBottom(isNotAtBottom);
  };

  useEffect(() => {
    scrollToBottom();

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => {
        chatContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [messages]);

  // Ensure client-only rendering for any non-deterministic UI bits
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const agentOptions = useMemo(
    () => [
      {
        id: "optimizer",
        name: "Optimizer",
        description: "AI-powered portfolio optimization",
        icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
        greeting:
          "I'm the Optimizer agent. I can help analyze your portfolio and suggest optimization strategies for better returns.",
      },
      {
        id: "risk",
        name: "Risk Guardian",
        description: "Risk analysis and management",
        icon: <Shield className="h-6 w-6 text-purple-500" />,
        greeting:
          "I'm your Risk Guardian. I'll help identify and mitigate risk factors in your portfolio and investment strategies.",
      },
      {
        id: "yield",
        name: "Yield Harvester",
        description: "Yield strategy optimization",
        icon: <BarChart3 className="h-6 w-6 text-green-500" />,
        greeting:
          "I'm the Yield Harvester. I'll help you maximize returns through optimized yield strategies and opportunities.",
      },
      {
        id: "research",
        name: "Market Researcher",
        description: "Market insights and analysis",
        icon: <Search className="h-6 w-6 text-amber-500" />,
        greeting:
          "I'm your Market Researcher. I can provide in-depth analysis and insights on market trends and opportunities.",
      },
    ],
    []
  );

  // Initialize with agent greeting when selected agent changes
  useEffect(() => {
    const selectedAgentOption = agentOptions.find(
      (agent) => agent.id === selectedAgent
    );

    if (selectedAgentOption && messages.length === 0) {
      const updatedMessages: Message[] = [
        {
          id: Date.now().toString(),
          content: selectedAgentOption.greeting,
          sender: "agent",
          timestamp: new Date(),
          agentType: selectedAgent,
        },
      ];
      setMessages(updatedMessages);
    } else if (
      selectedAgentOption &&
      messages.length > 0 &&
      messages[0].sender === "agent" &&
      messages[0].agentType !== selectedAgent
    ) {
      // Replace initial greeting when agent changes
      const updatedMessages = [...messages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        content: selectedAgentOption.greeting,
        agentType: selectedAgent,
      };
      setMessages(updatedMessages);
    }
  }, [selectedAgent, agentOptions, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentInput = inputValue;
    if (!currentInput.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      sender: "user",
      timestamp: new Date(),
      agentType: selectedAgent,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    setIsLoading(true);

    try {
      // Enhanced wallet validation
      if (!walletAddress) {
        throw new Error("Please connect your wallet to continue");
      }

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error(
          "Invalid wallet address format. Please reconnect your wallet."
        );
      }

      if (agentWalletStatus === "loading") {
        throw new Error(
          "Agent wallet is still being set up. Please wait a moment and try again."
        );
      }

      if (agentWalletStatus === "error") {
        throw new Error(
          "Agent wallet setup failed. Please refresh the page and try again."
        );
      }

      if (agentWalletStatus !== "ready") {
        throw new Error(
          "Agent wallet not ready. Please wait for setup to complete."
        );
      }

      console.log("[CHAT] Making API request with wallet:", walletAddress);
      console.log("[CHAT] Agent wallet status:", agentWalletStatus);
      console.log("[CHAT] Agent wallet address:", agentWalletAddress);

      // Prepare message history for the new API
      const messageHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Add the current message to history
      messageHistory.push({
        role: "user",
        content: currentInput,
      });

      // Try the new Sei agent endpoint first, fallback to original if it fails
      let response;
      try {
        response = await fetch("/api/sei-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: currentInput,
            userWalletAddress: walletAddress
          }),
        });
      } catch (error) {
        console.log("[CHAT] Sei agent endpoint failed, trying original endpoint:", error);
        // Fallback to original working endpoint
        response = await fetch("/api/chat-with-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userWalletAddress: walletAddress,
            chain_id: "sei-pacific", // Use Sei chain
            agent_id: selectedAgent,
            session_id: `session_${walletAddress}_${selectedAgent}`,
            messageHistory: messageHistory,
          }),
        });
      }

      console.log("[CHAT] API response status:", response.status);
      console.log("[CHAT] API response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[CHAT] API error response:", errorData);

        // Enhanced error handling based on status codes
        if (response.status === 503) {
          if (
            errorData.error?.includes("wallet") ||
            errorData.error?.includes("initialization")
          ) {
            throw new Error(
              `Wallet initialization error: ${errorData.error}. Please refresh the page and try again.`
            );
          } else if (
            errorData.error?.includes("cdp") ||
            errorData.error?.includes("coinbase")
          ) {
            throw new Error(
              `Coinbase Developer Platform error: ${errorData.error}. Please try again later.`
            );
          } else if (
            errorData.error?.includes("network") ||
            errorData.error?.includes("rpc")
          ) {
            throw new Error(
              `Network connection error: ${errorData.error}. Please check your connection and try again.`
            );
          } else {
            throw new Error(
              `Service temporarily unavailable: ${errorData.error}. Please try again in a moment.`
            );
          }
        } else if (response.status === 400) {
          if (errorData.error?.includes("wallet address")) {
            throw new Error(
              `Wallet connection error: ${errorData.error}. Please reconnect your wallet.`
            );
          } else {
            throw new Error(
              `Invalid request: ${errorData.error}. Please check your input and try again.`
            );
          }
        } else if (response.status === 401) {
          throw new Error(
            `Authentication error: ${errorData.error}. Please reconnect your wallet.`
          );
        } else {
          throw new Error(
            `API error (${response.status}): ${
              errorData.error || "Unknown error"
            }`
          );
        }
      }

      const data = await response.json();
      console.log("[CHAT] API response data:", data);

      // Handle both Sei agent and original agent responses
      if (data.success && data.message) {
        // Sei agent response format
        let messageContent = data.message;
        
        if (data.type === 'transaction' && data.transaction) {
          messageContent += `\n\n**Transaction Hash:** \`${data.transaction.hash}\``;
          messageContent += `\n**Status:** ${data.transaction.status}`;
          if (data.transaction.details) {
            messageContent += `\n**Details:** ${JSON.stringify(data.transaction.details, null, 2)}`;
          }
        }
        
        if (data.data) {
          if (data.type === 'table' && data.data.opportunities) {
            messageContent += '\n\n**Yield Opportunities:**';
            data.data.opportunities.forEach((opp: any) => {
              messageContent += `\n• **${opp.protocol}** - ${opp.apy}% APY (${opp.risk} risk)`;
            });
          } else if (data.data.suggestions) {
            messageContent += '\n\n**Trading Suggestions:**';
            data.data.suggestions.forEach((suggestion: any) => {
              messageContent += `\n• ${suggestion.message} - *${suggestion.action}*`;
            });
          }
        }

        const newAgentMessage: Message = {
          id: Date.now().toString(),
          content: messageContent,
          sender: "agent",
          timestamp: new Date(),
          agentType: data.metadata?.intent || selectedAgent,
        };

        setMessages((prev) => [...prev, newAgentMessage]);

        // If transaction was successful, refresh wallet data
        if (data.transaction?.hash) {
          console.log("[CHAT] Transaction detected, refreshing wallet data...");
          refreshAgentWallet();
        }
        
      } else if (data.agent_response) {
        // Original agent response format (fallback)
        const newAgentMessage: Message = {
          id: Date.now().toString(),
          content: data.agent_response,
          sender: "agent",
          timestamp: new Date(),
          agentType: selectedAgent,
        };

        setMessages((prev) => [...prev, newAgentMessage]);

        // Refresh agent wallet address after successful interaction
        console.log("[CHAT] Refreshing agent wallet address after successful interaction...");
        refreshAgentWallet();
        
      } else if (data.error || !data.success) {
        console.error("Agent error:", data.error || data.message);

        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `## Error\n\n**Details:** ${data.error || data.message}`,
          sender: "agent",
          timestamp: new Date(),
          agentType: selectedAgent,
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Failed to send message to agent:", error);

      // Enhanced error message formatting
      let errorContent = "";
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      if (errorMsg.includes("Wallet initialization error")) {
        errorContent = `## Wallet Connection Issue

⚠️ Your wallet connection needs to be refreshed.

**What happened:** ${errorMsg}

**Solution:** Please refresh the page, ensure your wallet is connected, and try again.`;
      } else if (
        errorMsg.includes("Wallet connection error") ||
        errorMsg.includes("Invalid wallet address")
      ) {
        errorContent = `## Wallet Connection Required

⚠️ Your wallet needs to be properly connected.

**What happened:** ${errorMsg}

**Solution:** Please connect your wallet using the "Connect Wallet" button in the top right corner.`;
      } else if (errorMsg.includes("Coinbase Developer Platform error")) {
        errorContent = `## Service Temporarily Unavailable

⚠️ The Coinbase Developer Platform is experiencing issues.

**What happened:** ${errorMsg}

**Solution:** Please try again in a few minutes.`;
      } else if (errorMsg.includes("Network connection error")) {
        errorContent = `## Network Connection Issue

⚠️ There's a problem with your network connection.

**What happened:** ${errorMsg}

**Solution:** Please check your internet connection and try again.`;
      } else if (errorMsg.includes("Authentication error")) {
        errorContent = `## Authentication Failed

⚠️ Your wallet authentication has expired.

**What happened:** ${errorMsg}

**Solution:** Please reconnect your wallet and try again.`;
      } else {
        errorContent = `## Error

Sorry, there was an error communicating with the agent.

**Details:** ${errorMsg}

**Solution:** Please try refreshing the page and try again.`;
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        sender: "agent",
        timestamp: new Date(),
        agentType: selectedAgent,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Wallet Status */}
      {walletAddress && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                User wallet: {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>

            {/* Agent Wallet Status */}
            <div className="flex items-center gap-2">
              {agentWalletStatus === "loading" && (
                <>
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-blue-700 font-medium">
                    Setting up agent wallet...
                  </span>
                </>
              )}
              {agentWalletStatus === "ready" && agentWalletAddress && (
                <>
                  <Bot className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Agent wallet: {agentWalletAddress.substring(0, 6)}...
                    {agentWalletAddress.substring(
                      agentWalletAddress.length - 4
                    )}
                  </span>
                </>
              )}
              {agentWalletStatus === "error" && (
                <>
                  <div className="h-4 w-4 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium">
                    Agent wallet setup failed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-6 py-6 border-b border-gray-200 bg-white shadow-clean">
        <div className="flex justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Portfolio Assistant
            </h1>
            <p className="text-gray-600 text-sm">
              Research, optimize, and automate your DeFi portfolio
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="relative flex flex-col flex-1 overflow-hidden">
        {/* Agent Selection Dropdown */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select AI Agent
                </label>
                <div className="relative">
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-clean transition-all appearance-none text-sm font-medium"
                  >
                    {agentOptions.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                        {!isMobile && ` - ${agent.description}`}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                      className="fill-current h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <span className="font-medium">Current:</span> {agentOptions.find(a => a.id === selectedAgent)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50"
          style={{ paddingBottom: isMobile ? "120px" : "100px" }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start mb-4 sm:mb-6 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "agent" && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-blue-600 to-purple-600 shadow-clean-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 max-w-[85%] sm:max-w-[75%] shadow-clean-md transition-all duration-200 hover:shadow-clean-lg ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto order-1"
                    : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {message.sender === "user" ? (
                  <p className="text-sm sm:text-base whitespace-pre-wrap font-medium">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-sm sm:text-base markdown-content leading-relaxed">
                    {renderMarkdown(message.content)}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <p
                    className={`text-xs ${
                      message.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                    suppressHydrationWarning
                  >
                    {hasMounted
                      ? new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  {message.sender === "agent" && message.agentType && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {agentOptions.find(a => a.id === message.agentType)?.name || message.agentType}
                    </span>
                  )}
                </div>
              </div>

              {message.sender === "user" && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ml-3 order-2 bg-gradient-to-br from-gray-600 to-gray-700 shadow-clean-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "absolute right-6 bg-blue-600 text-white p-3 rounded-full shadow-clean-lg hover:bg-blue-700 transition-all duration-200 z-40",
            isMobile ? "bottom-24" : "bottom-24"
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Fixed Input Area */}
      <div
        className={cn(
          "fixed p-4 sm:p-6 bg-white border-t border-gray-200 shadow-clean-xl z-50",
          isMobile ? "left-0 right-0 bottom-16" : "left-64 right-0 bottom-0"
        )}
        style={{
          paddingBottom: isMobile
            ? "1rem"
            : `calc(1rem + env(safe-area-inset-bottom))`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  isMobile
                    ? "Ask about portfolio, markets, or strategies..."
                    : "Ask about portfolio optimization, market research, risk management, or automation strategies..."
                }
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 sm:px-5 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-clean transition-all text-sm sm:text-base placeholder-gray-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className={cn(
                "bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-clean-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105",
                !inputValue.trim() || isLoading
                  ? "opacity-50 cursor-not-allowed transform-none"
                  : "hover:shadow-clean-lg"
              )}
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentChatPage;
