import ReactMarkdown from 'react-markdown';
import CodeBlock from './code-block';
// React 19 组件（支持新的 use() 钩子、自动批处理等特性）
enum EMarkdownPreviewSize {
  large = 'max-w-5xl',
  medium = 'max-w-3xl'
}

enum EMarkdownPreviewMode {
  edit = 'edit', // 编辑时
  read = 'read' // 阅读时
}


const MarkdownRenderer = ({ content, mode }: { content: string; mode: EMarkdownPreviewMode }) => {
  const size = mode === EMarkdownPreviewMode.edit ? EMarkdownPreviewSize.medium : EMarkdownPreviewSize.large;

  return (
    <div className={`markdown-preview ${size}`}>
      <ReactMarkdown
        // 自定义代码块渲染（支持语法高亮）
        components={{
          code: (props) => (<CodeBlock {...props} previewMode={mode}></CodeBlock>)
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

MarkdownRenderer.defaultProps = {
  mode: EMarkdownPreviewMode.edit,
};

export default MarkdownRenderer;
export { EMarkdownPreviewMode };
