import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { getUserContext } from 'packages/authModel/module/user';
import { CommunityService } from 'core/modules/community/services/community.service';

const actorOf = req => {
    const { payload } = getUserContext(req);
    const roles = payload.roles || [];
    return {
        userId: payload.id,
        role: roles.includes('admin') ? 'admin' : roles[0] || null,
    };
};

const toInt = (value, fallback) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

class Controller {
    constructor() {
        this.service = CommunityService;
    }

    createPost = async req => {
        const { userId } = actorOf(req);
        const data = await this.service.createPost({
            content: req.body.content,
            voiceUrl: req.body.voice_url,
            topic: req.body.topic,
            userId,
        });
        return ValidHttpResponse.toCreatedResponse(data);
    };

    listPosts = async req => {
        const data = await this.service.listPosts({
            topic: req.query.topic,
            page: toInt(req.query.page, 1),
            size: toInt(req.query.limit, 20),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    listPostsByUser = async req => {
        const data = await this.service.listPostsByUser({
            userId: req.params.user_id,
            page: toInt(req.query.page, 1),
            size: toInt(req.query.limit, 20),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    getPost = async req => {
        const data = await this.service.getPost(req.params.post_id);
        return ValidHttpResponse.toOkResponse(data);
    };

    updatePost = async req => {
        const data = await this.service.updatePost(
            req.params.post_id,
            { content: req.body.content, topic: req.body.topic },
            actorOf(req),
        );
        return ValidHttpResponse.toOkResponse(data);
    };

    deletePost = async req => {
        const data = await this.service.deletePost(req.params.post_id, actorOf(req));
        return ValidHttpResponse.toOkResponse(data);
    };

    createComment = async req => {
        const { userId } = actorOf(req);
        const data = await this.service.createComment(
            req.params.post_id,
            { content: req.body.content, parentId: req.body.parent_id },
            userId,
        );
        return ValidHttpResponse.toCreatedResponse(data);
    };

    listComments = async req => {
        const data = await this.service.listComments(req.params.post_id, {
            page: toInt(req.query.page, 1),
            size: toInt(req.query.limit, 20),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    getComment = async req => {
        const data = await this.service.getComment(req.params.comment_id);
        return ValidHttpResponse.toOkResponse(data);
    };

    updateComment = async req => {
        const data = await this.service.updateComment(
            req.params.comment_id,
            req.body.content,
            actorOf(req),
        );
        return ValidHttpResponse.toOkResponse(data);
    };

    deleteComment = async req => {
        const data = await this.service.deleteComment(req.params.comment_id, actorOf(req));
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const CommunityController = new Controller();
