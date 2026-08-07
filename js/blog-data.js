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

    // 添加文章到索引（同时维护公开索引）
    addPost(post) {
      const index = this.getPostIndex();
      // 按日期倒序插入
      index.unshift(post.id);
      this.savePostIndex(index);
      this.savePost(post);
      if (post.public) {
        this.addToPublicIndex(post.id);
      }
    },

    // 更新文章
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
      // 同时从公开索引移除
      const publicIndex = this.getPublicIndex().filter(pid => pid !== id);
      this.savePublicIndex(publicIndex);
    },

    addToPublicIndex(id) {
      const publicIndex = this.getPublicIndex();
      if (!publicIndex.includes(id)) {
        publicIndex.push(id);
        this.savePublicIndex(publicIndex);
      }
    },

    // 获取所有文章数据（用于管理后台列表）
    getAllPosts() {
      const index = this.getPostIndex();
      return index.map(id => this.getPost(id)).filter(p => p !== null);
    },

    // 获取所有公开文章数据（用于首页）
    getPublicPosts() {
      const publicIndex = this.getPublicIndex();
      return publicIndex.map(id => this.getPost(id)).filter(p => p !== null);
    }
  };
})();
