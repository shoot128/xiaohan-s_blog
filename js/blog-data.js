(function() {
  window.BlogData = {
    // 获取当前登录用户 ID
    getCurrentUserId() {
      return localStorage.getItem('blog_current_user_id') || null;
    },
    setCurrentUserId(id) {
      localStorage.setItem('blog_current_user_id', id);
    },
    clearCurrentUser() {
      localStorage.removeItem('blog_current_user_id');
    },

    // 用户列表
    getUserList() {
      const raw = localStorage.getItem('blog_user_list');
      return raw ? JSON.parse(raw) : [];
    },
    saveUserList(list) {
      localStorage.setItem('blog_user_list', JSON.stringify(list));
    },

    // 添加用户到列表
    addUser(user) {
      const list = this.getUserList();
      if (list.find(u => u.id === user.id)) return false;
      list.push(user);
      this.saveUserList(list);
      return true;
    },

    // 用户的加密盐和密码哈希（存储在一个单独的键中）
    getUserAuth(userId) {
      const raw = localStorage.getItem(`blog_auth_${userId}`);
      return raw ? JSON.parse(raw) : null;
    },
    saveUserAuth(userId, auth) {
      localStorage.setItem(`blog_auth_${userId}`, JSON.stringify(auth));
    },

    // 个人信息（按用户 ID）
    getProfile(userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return { name: '', bio: '', avatar: '', links: [] };
      const raw = localStorage.getItem(`blog_profile_${uid}`);
      return raw ? JSON.parse(raw) : { name: '', bio: '', avatar: '', links: [] };
    },
    saveProfile(userId, profile) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      localStorage.setItem(`blog_profile_${uid}`, JSON.stringify(profile));
    },

    // 文章索引（按用户）
    getPostIndex(userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return [];
      const raw = localStorage.getItem(`blog_posts_index_${uid}`);
      return raw ? JSON.parse(raw) : [];
    },
    savePostIndex(userId, index) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      localStorage.setItem(`blog_posts_index_${uid}`, JSON.stringify(index));
    },

    // 单篇文章（按用户）
    getPost(postId, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return null;
      const raw = localStorage.getItem(`blog_post_${uid}_${postId}`);
      return raw ? JSON.parse(raw) : null;
    },
    savePost(post, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      localStorage.setItem(`blog_post_${uid}_${post.id}`, JSON.stringify(post));
    },
    deletePost(postId, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      localStorage.removeItem(`blog_post_${uid}_${postId}`);
    },

    // 公开文章索引（全局，不限用户）
    getPublicIndex() {
      const raw = localStorage.getItem('blog_public_posts_index');
      return raw ? JSON.parse(raw) : [];
    },
    savePublicIndex(index) {
      localStorage.setItem('blog_public_posts_index', JSON.stringify(index));
    },

    // 添加文章（维护用户索引和全局公开索引）
    addPost(post, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      const index = this.getPostIndex(uid);
      index.unshift(post.id);
      this.savePostIndex(uid, index);
      this.savePost(post, uid);
      if (post.public) {
        const publicIndex = this.getPublicIndex();
        if (!publicIndex.includes(post.id)) {
          publicIndex.push(post.id);
          this.savePublicIndex(publicIndex);
        }
      }
    },

    // 更新文章
    updatePost(post, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      this.savePost(post, uid);
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
    removePost(postId, userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return;
      const index = this.getPostIndex(uid).filter(pid => pid !== postId);
      this.savePostIndex(uid, index);
      this.deletePost(postId, uid);
      const publicIndex = this.getPublicIndex().filter(pid => pid !== postId);
      this.savePublicIndex(publicIndex);
    },

    // 获取当前用户所有文章
    getAllPosts(userId) {
      const uid = userId || this.getCurrentUserId();
      if (!uid) return [];
      const index = this.getPostIndex(uid);
      const posts = index.map(id => this.getPost(id, uid)).filter(p => p !== null);
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    },

    // 获取全局公开文章（需从所有用户中收集，但简化：只从公开索引读取，然后去各个用户存储查找）
    getPublicPosts() {
      const publicIndex = this.getPublicIndex();
      const posts = [];
      for (const pid of publicIndex) {
        // 遍历所有可能用户？直接遍历 localStorage 查找
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('blog_post_') && key.endsWith('_' + pid)) {
            try {
              const p = JSON.parse(localStorage.getItem(key));
              if (p && p.public) posts.push(p);
            } catch (e) {}
            break;
          }
        }
      }
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    }
  };
})();
