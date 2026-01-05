##


## 学习规划
- 路由搭建（首页，分类，新建）0.2pd
- UI框架搭建 0.3pd
  - 顶部导航栏：tab（首页，新建），主题设置
  - 底部导航：相关信息，快捷link
- 静态列表和详情页
  - 静态列表：
    - mock静态列表数据
    - 接口调用
    - 开发列表ui：列表卡 + tag筛选 + 搜索
  - blog详情页：
    - mock静态详情markdown数据
    - 接口调用
    - 开发详情页ui
      - 目录
      - 详情
- 创建blog页
  - markdown编辑器
  - markdown实时预览
- 优化
  - 空数据，异常状态，loading态
  - SEO优化
  - 列表分页优化
- 部署到vercel
- 进阶规划：
  - 在文章增加备注（仅个人可见）
  - 建立评论系统：集成giscus + 支持github登陆
  - 文章版本历史：阅读管理历史版本
  - 阅读时长统计
  - 学习时间轴
  - 移动端适配



## 问题：
- supabase 是企业级处理方案吗
- 在next中，如果使用了supabase，哪些提交/查询操作需要新增接口，哪些可以直接在组件内直接写
- use client使用的场景除了使用到一些浏览器API，还有哪些场景
- 怎么实现局部组件之间共享样式集合
  ```css
  @layer components {
    .btn-primary {
      @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
    }
    .btn-secondary {
      @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
    }
  }
  ```

  ```jsx
  import styles from './xx.module.css'

  export default function Button() {

    return (<div className={styles.btnPrimary}></div>)
  }
  ```
- tailwind utilities 配置不生效
- dynamic是干什么的
  ```jsx
  import dynamic from "next/dynamic";

  const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
  );
  ```