import { NotFoundException, BadRequestException } from 'packages/httpException';
import { ForbiddenException } from 'packages/httpException/ForbiddenException';
import { CommunityPostRepository } from '../repositories/community-post.repository';
import { CommentRepository } from '../repositories/comment.repository';

const ROLE_ADMIN = 'admin';

const mapAuthor = row => ({
    user_id: row.userId,
    full_name: row.fullName || null,
});

class Service {
    constructor() {
        this.postRepository = CommunityPostRepository;
        this.commentRepository = CommentRepository;
    }

    async createPost({ content, voiceUrl = null, topic = null, userId }) {
        if (!content && !voiceUrl) {
            throw new BadRequestException('content hoặc voice_url là bắt buộc');
        }
        const [post] = await this.postRepository.createOne({
            user_id: userId,
            content: content || null,
            voice_url: voiceUrl,
            topic,
        });
        return {
            post_id: post.id,
            user_id: post.userId,
            created_at: post.createdAt,
            message: 'Đăng bài thành công',
        };
    }

    async listPosts({ topic, page = 1, size = 20 }) {
        const [rows, total] = await Promise.all([
            this.postRepository.list({ topic, page, size }),
            this.postRepository.total({ topic }),
        ]);
        const data = await Promise.all(
            rows.map(async row => ({
                post_id: row.id,
                author: mapAuthor(row),
                content: row.content,
                voice_url: row.voiceUrl,
                topic: row.topic,
                created_at: row.createdAt,
                comments_count: await this.commentRepository.countByPost(row.id),
            })),
        );
        return { total, page, limit: size, data };
    }

    async listPostsByUser({ userId, page = 1, size = 20 }) {
        const [rows, total] = await Promise.all([
            this.postRepository.list({ userId, page, size }),
            this.postRepository.total({ userId }),
        ]);
        return {
            total,
            page,
            limit: size,
            data: rows.map(row => ({
                post_id: row.id,
                content: row.content,
                voice_url: row.voiceUrl,
                topic: row.topic,
                created_at: row.createdAt,
            })),
        };
    }

    async getPost(postId) {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        return {
            post_id: post.id,
            content: post.content,
            voice_url: post.voiceUrl,
            topic: post.topic,
            author: mapAuthor(post),
            created_at: post.createdAt,
            updated_at: post.updatedAt,
        };
    }

    async updatePost(postId, { content, topic }, actor) {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        this.#assertOwnerOrAdmin(post.userId, actor);

        const patch = {};
        if (content !== undefined) patch.content = content;
        if (topic !== undefined) patch.topic = topic;
        if (Object.keys(patch).length === 0) {
            throw new BadRequestException('Không có trường nào để cập nhật');
        }
        const [updated] = await this.postRepository.updateOne(postId, patch);
        return {
            status: 'success',
            message: 'Cập nhật bài đăng thành công',
            updated_at: updated.updatedAt,
        };
    }

    async deletePost(postId, actor) {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        this.#assertOwnerOrAdmin(post.userId, actor);
        const [deleted] = await this.postRepository.softDelete(postId);
        return {
            status: 'success',
            message: 'Đã xóa bài đăng',
            deleted_at: deleted.deletedAt,
        };
    }

    async createComment(postId, { content, parentId = null }, userId) {
        if (!content) throw new BadRequestException('content là bắt buộc');
        const post = await this.postRepository.findById(postId);
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        const [comment] = await this.commentRepository.createOne({
            post_id: postId,
            user_id: userId,
            parent_id: parentId,
            content,
        });
        return {
            comment_id: comment.id,
            post_id: comment.postId,
            user_id: comment.userId,
            created_at: comment.createdAt,
        };
    }

    async listComments(postId, { page = 1, size = 20 }) {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        const [rows, total] = await Promise.all([
            this.commentRepository.listByPost(postId, page, size),
            this.commentRepository.countByPost(postId),
        ]);
        return {
            total,
            page,
            limit: size,
            data: rows.map(row => ({
                comment_id: row.id,
                content: row.content,
                author: mapAuthor(row),
                created_at: row.createdAt,
            })),
        };
    }

    async getComment(commentId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
        return {
            comment_id: comment.id,
            post_id: comment.postId,
            user_id: comment.userId,
            content: comment.content,
            created_at: comment.createdAt,
            updated_at: comment.updatedAt,
        };
    }

    async updateComment(commentId, content, actor) {
        if (!content) throw new BadRequestException('content là bắt buộc');
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
        this.#assertOwnerOrAdmin(comment.userId, actor);
        const [updated] = await this.commentRepository.updateOne(commentId, content);
        return {
            status: 'success',
            message: 'Cập nhật bình luận thành công',
            updated_at: updated.updatedAt,
        };
    }

    async deleteComment(commentId, actor) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new NotFoundException('Không tìm thấy bình luận');

        if (comment.userId !== actor.userId && actor.role !== ROLE_ADMIN) {
            const post = await this.postRepository.findById(comment.postId);
            const isPostOwner = post && post.userId === actor.userId;
            if (!isPostOwner) {
                throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
            }
        }
        const [deleted] = await this.commentRepository.softDelete(commentId);
        return {
            status: 'success',
            message: 'Đã xóa bình luận',
            deleted_at: deleted.deletedAt,
        };
    }

    #assertOwnerOrAdmin(ownerId, actor) {
        if (ownerId !== actor.userId && actor.role !== ROLE_ADMIN) {
            throw new ForbiddenException();
        }
    }
}

export const CommunityService = new Service();
