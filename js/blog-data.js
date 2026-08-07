(function() {
  window.BlogData = {
    // ========== 个人信息 ==========
    getProfile() {
      const raw = localStorage.getItem('blog_profile');
      return raw ? JSON.parse(raw) : { name: '', bio: '', avatar: '', links: [] };
    },
    saveProfile(profile) {
      localStorage.setItem('blog_profile', JSON.stringify(profile));
    },

    // ========== 文章索引 ==========
    getPostIndex() {
      const raw = localStorage.getItem('blog_posts_index');
      return raw ? JSON.parse(raw) : [];
    },
    savePostIndex(index) {
      localStorage.setItem('blog_posts_index', JSON.stringify(index));
    },

    // ========== 单篇文章 ==========
    getPost(id) {
      const raw = localStorage.getItem(`blog_post_${id}`);
      return raw ? JSON.parse(raw) : null;
    },
    savePost(post) {
      localStorage.setItem(`blog_post_${post.id}`, JSON.stringify(post));
    },
    deletePost(id) {
      localStorage.removeItem(`blog_post_${id}`);
    },

    // ========== 公开文章索引 ==========
    getPublicIndex() {
      const raw = localStorage.getItem('blog_public_posts_index');
      return raw ? JSON.parse(raw) : [];
    },
    savePublicIndex(index) {
      localStorage.setItem('blog_public_posts_index', JSON.stringify(index));
    },

    // 添加文章（维护索引和公开索引）
    addPost(post) {
      const index = this.getPostIndex();
      index.unshift(post.id);
      this.savePostIndex(index);
      this.savePost(post);
      if (post.public) {
        const publicIndex = this.getPublicIndex();
        if (!publicIndex.includes(post.id)) {
          publicIndex.push(post.id);
          this.savePublicIndex(publicIndex);
        }
      }
    },

    // 更新文章（同步公开索引）
    updatePost(post) {
      this.savePost(post);
      const publicIndex = this.getPublicIndex();
      const idx = publicIndex.indexOf(post.id);
      if (post.public && idx === -1) {
        publicIndex.push(post.id);
        this.savePublicIndex(publicIndex);
      } else if (!post.public && idx !== -1) {
        publicIndex.splice(idx, 1);
        this.savePublicIndex(publicIndex);
      }
    },

    // 删除文章
    removePost(id) {
      const index = this.getPostIndex().filter(pid => pid !== id);
      this.savePostIndex(index);
      this.deletePost(id);
      const publicIndex = this.getPublicIndex().filter(pid => pid !== id);
      this.savePublicIndex(publicIndex);
    },

    // 获取所有文章（按日期倒序）
    getAllPosts() {
      const index = this.getPostIndex();
      const posts = index.map(id => this.getPost(id)).filter(p => p !== null);
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    },

    // 获取所有公开文章（按日期倒序）
    getPublicPosts() {
      const publicIndex = this.getPublicIndex();
      const posts = publicIndex.map(id => this.getPost(id)).filter(p => p !== null);
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    }
  };
})();
