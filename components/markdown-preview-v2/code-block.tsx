'use client';

import { useState } from 'react';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ClipboardIcon, CheckIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text, IconButton, Tooltip } from '@radix-ui/themes';
import { useToast } from '@/providers/toast-provider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = ({ className, children, previewMode, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    showToast('已复制', 'success');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return match ? (
    <Box className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {previewMode === 'read' && (
        <Flex
          justify="between"
          align="center"
          className="px-3 py-2 bg-gray-50 dark:bg-[#282a36] border-b border-gray-200 dark:border-gray-700"
        >
          <Text
            size="1"
            weight="bold"
            className="uppercase text-gray-500 dark:text-gray-400"
          >
            {language}
          </Text>
          <Tooltip content={isCopied ? '已复制' : '复制'}>
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              onClick={handleCopy}
            >
              {isCopied ? <CheckIcon /> : <ClipboardIcon />}
            </IconButton>
          </Tooltip>
        </Flex>
      )}
      <SyntaxHighlighter
        style={dracula}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0 }}
        {...props}
      >
        {codeContent}
      </SyntaxHighlighter>
    </Box>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;
