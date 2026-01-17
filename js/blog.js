// ==================== 博客系统 ====================

class BlogSystem {
    constructor() {
        this.posts = [];
        this.currentView = 'list';
        this.currentPost = null;
        this.marked = null;

        this.init();
    }

    async init() {
        // 等待marked.js加载
        await this.waitForMarked();

        // 加载文章索引
        await this.loadPosts();

        // 设置路由监听
        this.setupRouting();

        // 初始化视图
        this.handleRoute();
    }

    // 等待marked.js加载完成
    async waitForMarked() {
        return new Promise((resolve) => {
            const checkMarked = () => {
                if (typeof window.marked !== 'undefined') {
                    this.marked = window.marked;
                    resolve();
                } else {
                    setTimeout(checkMarked, 100);
                }
            };
            checkMarked();
        });
    }

    // 加载文章索引
    async loadPosts() {
        try {
            const response = await fetch('posts/index.json');
            const data = await response.json();
            this.posts = data.posts.sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.posts = [];
        }
    }

    // 设置路由
    setupRouting() {
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    // 处理路由
    handleRoute() {
        const hash = window.location.hash;

        if (hash.startsWith('#blog/post/')) {
            const slug = hash.replace('#blog/post/', '');
            this.showPost(slug);
        } else if (hash === '#blog') {
            this.showList();
        }
    }

    // 显示文章列表
    showList(filter = 'all') {
        const listView = document.getElementById('blog-list-view');
        const detailView = document.getElementById('blog-detail-view');
        const grid = document.getElementById('blog-grid');

        if (!listView || !detailView || !grid) {
            console.error('Blog elements not found');
            return;
        }

        // 切换视图
        listView.classList.remove('hidden');
        detailView.classList.add('hidden');

        // 过滤并渲染文章
        const filteredPosts = filter === 'all'
            ? this.posts
            : this.posts.filter(p => p.category === filter);

        grid.innerHTML = filteredPosts.map(post => this.createPostCard(post)).join('');

        // 绑定卡片点击事件
        grid.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                window.location.hash = `#blog/post/${slug}`;
            });
        });

        // 绑定过滤器事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b =>
                    b.classList.remove('active'));
                e.target.classList.add('active');
                this.showList(e.target.dataset.filter);
            });
        });

        // 滚动到博客区域
        this.scrollToBlog();
    }

    // 创建文章卡片HTML
    createPostCard(post) {
        return `
            <article class="blog-card" data-slug="${post.slug}">
                <div class="blog-card-header">
                    <div class="blog-card-date">${this.formatDate(post.date)}</div>
                    <h3 class="blog-card-title">${post.title}</h3>
                </div>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <div class="blog-card-tags">
                        ${post.tags.map(tag =>
                            `<span class="blog-tag">${tag}</span>`
                        ).join('')}
                    </div>
                    <span class="read-more-btn">
                        阅读全文 <span>→</span>
                    </span>
                </div>
            </article>
        `;
    }

    // 显示文章详情
    async showPost(slug) {
        const listView = document.getElementById('blog-list-view');
        const detailView = document.getElementById('blog-detail-view');
        const postContainer = document.getElementById('blog-post');

        if (!listView || !detailView || !postContainer) {
            console.error('Blog elements not found');
            return;
        }

        // 切换视图
        listView.classList.add('hidden');
        detailView.classList.remove('hidden');

        // 显示加载动画
        postContainer.innerHTML = '<div class="blog-loading">加载中</div>';

        try {
            // 加载文章内容
            const response = await fetch(`posts/${slug}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();

            // 解析front matter和内容
            const { meta, content } = this.parseMarkdown(markdown);

            // 渲染文章
            postContainer.innerHTML = this.createPostHTML(meta, content);

            // 绑定返回按钮
            const backBtn = document.getElementById('back-to-blog');
            if (backBtn) {
                backBtn.onclick = () => {
                    window.location.hash = '#blog';
                };
            }

            // 滚动到博客区域
            this.scrollToBlog();

        } catch (error) {
            console.error('Failed to load post:', error);
            postContainer.innerHTML = '<p class="blog-loading">文章加载失败</p>';
        }
    }

    // 解析Markdown front matter
    parseMarkdown(markdown) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = markdown.match(frontMatterRegex);

        if (match) {
            const metaStr = match[1];
            const content = match[2];

            // 简单解析YAML front matter
            const meta = {};
            metaStr.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();

                    // 移除引号
                    value = value.replace(/^["']|["']$/g, '');

                    // 解析数组
                    if (value.startsWith('[') && value.endsWith(']')) {
                        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
                    }

                    meta[key] = value;
                }
            });

            return { meta, content };
        }

        return { meta: {}, content: markdown };
    }

    // 创建文章详情HTML
    createPostHTML(meta, content) {
        const htmlContent = this.marked.parse(content);

        return `
            <div class="blog-post-header">
                <h1 class="blog-post-title">${meta.title || ''}</h1>
                <div class="blog-post-meta">
                    <span class="blog-post-date">
                        📅 ${this.formatDate(meta.date)}
                    </span>
                    ${meta.category ? `<span>📁 ${meta.category}</span>` : ''}
                    ${meta.tags ? `<span>🏷️ ${Array.isArray(meta.tags) ? meta.tags.join(', ') : meta.tags}</span>` : ''}
                </div>
            </div>
            <div class="blog-post-content">
                ${htmlContent}
            </div>
        `;
    }

    // 格式化日期
    formatDate(dateStr) {
        if (!dateStr) return '';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 滚动到博客区域
    scrollToBlog() {
        const blogSection = document.getElementById('blog');
        if (blogSection) {
            blogSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// 初始化博客系统
document.addEventListener('DOMContentLoaded', () => {
    new BlogSystem();
});
